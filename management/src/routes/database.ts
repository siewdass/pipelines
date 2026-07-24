import { Router, type Router as RouterType } from 'express'
import { getContext } from '../services/db'
import { verifyToken } from '../services/auth'
import { config } from '../config'

export const databaseRouter: RouterType = Router()

databaseRouter.use((req, res, next) => {
	const token = (req.headers['x-project-id'] || req.headers['project-id']) as string
	if (!token) {
		res.status(401).json({ error: 'Project token is missing' })
		return
	}
	try {
		const payload = verifyToken(token, config.accountJwtSecret)
		const id = (payload.id || payload.projectId) as string
    ;(req as any).projectId = id
		next()
	} catch {
		res.status(401).json({ error: 'Invalid project token' })
	}
})

databaseRouter.get('/tables', async (req, res) => {
	try {
		const projectId = (req as any).projectId
		const { db } = await getContext(projectId)
		const schemasCol = db.collection('schemas')
		const schemas = await schemasCol.find().toArray()

		const enrichedSchemas = await Promise.all(schemas.map(async (schema: any) => {
			const collectionName = schema._id
			let count = 0
			let sizeKb = 0
			let avgObjSizeRaw = 0

			try {
				const stats = await db.command({ collStats: collectionName })
				count = stats.count || 0
				sizeKb = Math.round((stats.size / 1024) * 100) / 100
				avgObjSizeRaw = stats.avgObjSize || 0
			} catch (e) {
				// Collection might not exist physically yet
			}

			return {
				id: schema._id,
				name: schema.name || collectionName,
				associations: schema.associations || {},
				count,
				sizeKb,
				avgObjSize: Math.round(avgObjSizeRaw)
			}
		}))

		res.json({ collections: enrichedSchemas })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

databaseRouter.get('/fetch', async (req, res) => {
	try {
		const projectId = (req as any).projectId
		const { collection, doc, association } = req.query
		const { db } = await getContext(projectId)

		let associations = {}
		let fields = {}
		let colName = collection as string
		let filter = {}

		const schemasCol = db.collection('schemas')

		if (association) {
			const assocName = (association as any).name
			const schemaDoc = await schemasCol.findOne({ _id: collection as any })

			if (schemaDoc && schemaDoc.associations && schemaDoc.associations[assocName]) {
				const assoc = schemaDoc.associations[assocName]
				const type = assoc.type
				const relatedCollection = assoc.collection
				if (doc) {
					if (type === 'one-to-many') {
						filter = { [collection as string]: (doc as any)._id }
					} else if (type === 'one-to-one') {
						filter = { _id: (doc as any)[assocName] }
					}
				}
				colName = relatedCollection
				const schemaDoc2 = await schemasCol.findOne({ _id: relatedCollection as any })
				associations = schemaDoc2?.associations || {}
				fields = schemaDoc2?.fields || {}
			}
		} else {
			const schemaDoc = await schemasCol.findOne({ _id: collection as any })
			associations = schemaDoc?.associations || {}
			fields = schemaDoc?.fields || {}
		}

		const col = db.collection(colName)
		const docs = await col.find(filter).toArray()

		const expandDoc = async (d: any, source: string, assocs: any) => {
			for (const key of Object.keys(assocs)) {
				const assoc = assocs[key]
				const type = assoc.type
				const target = assoc.collection

				if (type === 'one-to-one') {
					if (typeof d[key] === 'string') {
						const related = await db.collection(target).findOne({ _id: d[key] })
						if (related) d[key] = related
					}
				} else if (type === 'one-to-many') {
					const parentId = d._id
					const related = await db.collection(target).find({ [source]: parentId }).toArray()
					d[key] = related
				} else if (type === 'many-to-many') {
					const pivotName = `${source}_${target}`
					const parentId = d._id
					const relations = await db.collection(pivotName).find({ [source]: parentId }).project({ [target]: 1, _id: 0 }).toArray()
					const ids = relations.map((r: any) => r[target])
					if (ids.length > 0) {
						const related = await db.collection(target).find({ _id: { $in: ids } }).toArray()
						d[key] = related
					} else {
						d[key] = []
					}
				}
			}
		}

		for (const d of docs) {
			await expandDoc(d, colName, associations)
		}

		res.json({ collection: colName, docs, schema: associations, fields })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

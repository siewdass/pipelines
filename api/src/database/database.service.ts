import { Injectable } from '@nestjs/common'
import { ProjectService } from '../project/project.service'

@Injectable()
export class DatabaseService {
	constructor(
    private readonly projectService: ProjectService
	) {}

	prepare(data: any): { collection: string; doc?: any; association?: any } {
		return {
			collection: data.collection,
			doc: data.doc ?? undefined,
			association: data.association ?? undefined
		}
	}

	async getTablesMetadata(projectId: string): Promise<any[]> {
		const dbContext = await this.projectService.getProjectContext(projectId)
		const schemasCol = dbContext.db.collection('schemas')
		const schemas = await schemasCol.find().toArray()

		const enrichedSchemas = await Promise.all(schemas.map(async (schema) => {
			const collectionName = (schema._id as any) as string
			
			let count = 0
			let sizeKb = 0
			let avgObjSizeRaw = 0

			try {
				const stats = await dbContext.db.command({ collStats: collectionName })
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

		return enrichedSchemas
	}

	async fetch(projectId: string, collection: string, query: any = {}, association?: any, doc?: any): Promise<any> {
		const dbContext = await this.projectService.getProjectContext(projectId)
		let associations = {}
		let fields = {}
		let colName = collection
		let filter = query
		const schemasCol = dbContext.db.collection('schemas')

		if (association) {
			const assocName = association.name
			let schemaDoc = await schemasCol.findOne({ _id: collection as any })
			
			if (schemaDoc && schemaDoc.associations && schemaDoc.associations[assocName]) {
				const assoc = schemaDoc.associations[assocName]
				const type = assoc.type
				const relatedCollection = assoc.collection
				if (doc) {
					if (type === 'one-to-many') {
						filter = { [collection]: doc._id }
					} else if (type === 'one-to-one') {
						filter = { _id: doc[assocName] }
					}
				}
				colName = relatedCollection
				schemaDoc = await schemasCol.findOne({ _id: relatedCollection as any })
				associations = schemaDoc?.associations || {}
				fields = schemaDoc?.fields || {}
			}
		} else {
			const schemaDoc = await schemasCol.findOne({ _id: collection as any })
			associations = schemaDoc?.associations || {}
			fields = schemaDoc?.fields || {}
		}

		const col = dbContext.db.collection(colName)
		const docs = await col.find(filter).toArray()
		for (const d of docs) {
			await this.expandDoc(dbContext.db, d, colName, associations)
		}

		return {
			collection: colName,
			docs,
			schema: associations,
			fields
		}
	}

	async expandDoc(db: any, doc: any, source: string, associations: any): Promise<void> {
		for (const key of Object.keys(associations)) {
			const assoc = associations[key]
			const type = assoc.type
			const target = assoc.collection

			if (type === 'one-to-one') {
				if (typeof doc[key] === 'string') {
					const related = await db.collection(target).findOne({ _id: doc[key] })
					if (related) doc[key] = related
				}
			} else if (type === 'one-to-many') {
				const parentId = doc._id
				const related = await db.collection(target).find({ [source]: parentId }).toArray()
				doc[key] = related
			} else if (type === 'many-to-many') {
				const pivotName = `${source}_${target}`
				const parentId = doc._id
				const relations = await db.collection(pivotName).find({ [source]: parentId }).project({ [target]: 1, _id: 0 }).toArray()
				const ids = relations.map(r => r[target])
				if (ids.length > 0) {
					const related = await db.collection(target).find({ _id: { $in: ids } }).toArray()
					doc[key] = related
				} else {
					doc[key] = []
				}
			}
		}
	}
}

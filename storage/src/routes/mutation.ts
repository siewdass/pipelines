import { Router, type Router as RouterType } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getContext } from '../services/db'
import { getOptions, download } from '../services/mutation'
import { isProtectedSource } from '../services/protected'
import { getSourceAccess, ensureSourceRegistered, type SourceAccess } from '../services/access'
import { hasPermission, getUser } from '../middleware/permissions'

export const mutationRouter: RouterType = Router()

function assertSourceAllowed(source: string, res: any): boolean {
	if (isProtectedSource(source)) {
		res.status(403).json({ error: `Source '${source}' is protected` })
		return false
	}
	return true
}

async function assertAccess(req: any, res: any, source: string, sourceAccess: SourceAccess, access: 'read' | 'write'): Promise<boolean> {
	if (sourceAccess !== 'private') return true
	const user = getUser(req)
	if (!user || !hasPermission(user.permissions, source, access)) {
		res.status(403).json({ error: `Permission denied: ${source}:${access}` })
		return false
	}
	return true
}

mutationRouter.post('/upsert', async (req, res) => {
	try {
		const { source, input, options } = req.body
		if (!assertSourceAllowed(source, res)) return
		const projectId = (req as any).projectId as string
		const { db } = await getContext(projectId)
		const sourceAccess = await getSourceAccess(db, source)
		if (!(await assertAccess(req, res, source, sourceAccess, 'write'))) return
		await ensureSourceRegistered(db, source)
		const settings = getOptions(options ?? {})
		const collection = db.collection(source)
		const { _id, ...data } = input || {}

		if (_id) {
			data._id = _id
		}

		if (settings?.audit) {
			if (!data._id) data.createdAt = new Date()
			data.updatedAt = new Date()
		}

		if (data._id) {
			const copy = { ...data }
			await download(db, copy, source, String(data._id), settings, undefined, 'upsert')
			await collection.updateOne({ _id: data._id }, { $set: copy }, { upsert: true })
		} else {
			if (settings?.uniques) {
				const { uniques: _, ...rest } = settings
				await download(db, data, source, '', rest, undefined, 'upsert')
				const finalDoc: any = { ...data }
				finalDoc._id = uuidv4()
				if (settings.audit) finalDoc.createdAt = new Date()
				await collection.insertOne(finalDoc)
			} else {
				data._id = uuidv4()
				if (settings.audit) data.createdAt = new Date()
				const copy = { ...data }
				await download(db, copy, source, String(data._id), settings, undefined, 'upsert')
				await collection.insertOne(copy)
			}
		}

		res.json({ success: true, message: 'Upsert successful' })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

mutationRouter.post('/purge', async (req, res) => {
	try {
		const { source, input } = req.body
		if (!assertSourceAllowed(source, res)) return
		const projectId = (req as any).projectId as string
		const { db } = await getContext(projectId)
		const sourceAccess = await getSourceAccess(db, source)
		if (!(await assertAccess(req, res, source, sourceAccess, 'write'))) return
		const collection = db.collection(source)
		const ids = Array.isArray(input) ? input : [ input ]

		for (const item of ids) {
			const id = typeof item === 'string' ? item : item._id
			if (!id) continue
			const doc = await collection.findOne({ _id: id })
			if (doc) {
				await download(db, doc, source, String(id), {}, undefined, 'delete')
				await collection.deleteOne({ _id: id })
			}
		}

		res.json({ success: true, message: 'Purge successful' })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

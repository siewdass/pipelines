import { Router, type Router as RouterType } from 'express'
import { getContext } from '../services/db'

export const sourceRouter: RouterType = Router()

sourceRouter.get('/:projectId', async (req, res) => {
	try {
		const { projectId } = req.params
		const { db } = await getContext(projectId)
		const sources = db.collection('sources')
		const list = await sources.find({ projectId }).sort({ createdAt: -1 }).limit(10).toArray()
		res.json(list)
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

sourceRouter.get('/:projectId/:sourceId', async (req, res) => {
	try {
		const { projectId, sourceId } = req.params
		const { db } = await getContext(projectId)
		const sources = db.collection('sources')
		const source = await sources.findOne({ _id: sourceId, projectId })
		if (!source) {
			res.status(404).json({ error: 'Source not found' })
			return
		}
		res.json(source)
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

sourceRouter.delete('/:projectId/:sourceId', async (req, res) => {
	try {
		const { projectId, sourceId } = req.params
		const { db } = await getContext(projectId)
		const sources = db.collection('sources')
		const result = await sources.deleteOne({ _id: sourceId, projectId })
		if (result.deletedCount === 0) {
			res.status(404).json({ error: 'Source not found' })
			return
		}
		res.json({ deleted: true })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

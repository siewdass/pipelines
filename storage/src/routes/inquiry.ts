import { Router, type Router as RouterType } from 'express'
import { getContext } from '../services/db'
import { getOptions, getProjection, upload, serialize } from '../services/inquiry'

export const inquiryRouter: RouterType = Router()

inquiryRouter.post('/index', async (req, res) => {
  try {
    const { source, output, options } = req.body
    const projectId = (req as any).projectId as string
    const { db } = await getContext(projectId)
    const col = db.collection(source)
    const { filter } = getOptions(options ?? {})
    const { projection, nested } = getProjection(output)

    const doc = await col.findOne(filter ?? {}, { projection })
    if (!doc) {
      res.status(404).json({ error: 'Document not found' })
      return
    }
    if (nested) {
      await upload(doc, nested as any, db, source, options ?? {})
    }
    res.json({ item: serialize(doc) })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

inquiryRouter.post('/retrieve', async (req, res) => {
  try {
    const { source, output, options } = req.body
    const projectId = (req as any).projectId as string
    const { db } = await getContext(projectId)
    const col = db.collection(source)
    const { filter, sort, pagination } = getOptions(options ?? {})
    const { projection, nested } = getProjection(output)

    let cursor = col.find(filter ?? {}, { projection }).sort(sort ?? {})
    if (pagination) {
      pagination.total = await col.countDocuments(filter ?? {})
      pagination.pages = Math.ceil(pagination.total / pagination.limit)
      cursor = cursor.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit)
    }
    const docs = await cursor.toArray()
    for (const doc of docs) {
      await upload(doc, nested as any, db, source, options ?? {})
    }
    const items = serialize(docs)
    res.json(pagination ? { items, pagination } : { items })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

import { Router, type Router as RouterType } from 'express'
import multer from 'multer'
import { existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { getContext } from '../services/db'

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/data/uploads'

if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true })
}

let uuidv4: () => string

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: async (_req, file, cb) => {
    if (!uuidv4) {
      uuidv4 = (await import('uuid')).v4
    }
    const ext = file.originalname.split('.').pop() || ''
    cb(null, `${uuidv4()}.${ext}`)
  },
})

const upload = multer({ storage })

export const assetsRouter: RouterType = Router()

assetsRouter.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const projectId = (req as any).projectId as string
    const file = req.file
    if (!file) {
      res.status(400).json({ error: 'No file provided' })
      return
    }

    const { db } = await getContext(projectId)
    const assets = db.collection('assets')

    const { v4: uuidv4 } = await import('uuid')
    const doc = {
      _id: uuidv4() as any,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      diskPath: file.filename,
      createdAt: new Date(),
    }

    await assets.insertOne(doc as any)

    res.json({
      success: true,
      asset: {
        id: doc._id,
        filename: doc.filename,
        mimetype: doc.mimetype,
        size: doc.size,
      },
    })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

assetsRouter.get('/:id', async (req, res) => {
  try {
    const projectId = (req as any).projectId as string
    const { db } = await getContext(projectId)
    const assets = db.collection('assets')

    const doc = await assets.findOne({ _id: req.params.id as any })
    if (!doc) {
      res.status(404).json({ error: 'Asset not found' })
      return
    }

    const filePath = join(UPLOADS_DIR, doc.diskPath as string)
    if (!existsSync(filePath)) {
      res.status(404).json({ error: 'File not found on disk' })
      return
    }

    res.setHeader('Content-Type', doc.mimetype as string)
    res.setHeader('Content-Disposition', `inline; filename="${doc.filename}"`)
    res.sendFile(filePath)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

assetsRouter.delete('/:id', async (req, res) => {
  try {
    const projectId = (req as any).projectId as string
    const userId = (req as any).userId as string | undefined
    const { db } = await getContext(projectId)
    const assets = db.collection('assets')

    const doc = await assets.findOne({ _id: req.params.id as any })
    if (!doc) {
      res.status(404).json({ error: 'Asset not found' })
      return
    }

    const filePath = join(UPLOADS_DIR, doc.diskPath as string)
    if (existsSync(filePath)) {
      unlinkSync(filePath)
    }

    await assets.deleteOne({ _id: req.params.id as any })

    res.json({ success: true, message: 'Asset deleted' })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

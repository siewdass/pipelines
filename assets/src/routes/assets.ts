import { Router, type Router as RouterType } from 'express'
import multer from 'multer'
import { existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { getContext } from '../services/db'
import { config } from '../config'
import { verifyToken } from '../services/auth'
import { isAllowed, getKind } from '../services/mimetypes'
import { requireUser, requirePermission, hasPermission } from '../middleware/permissions'

const UPLOADS_DIR = config.uploadsDir

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

assetsRouter.post('/upload', requireUser, requirePermission('assets', 'write'), upload.single('file'), async (req, res) => {
	try {
		const projectId = (req as any).projectId as string
		const userId = (req as any).user?.id as string | undefined
		const file = req.file
		if (!file) {
			res.status(400).json({ error: 'No file provided' })
			return
		}
		if (!isAllowed(file.mimetype)) {
			res.status(400).json({ error: `File type not allowed: ${file.mimetype}` })
			return
		}

		const access = req.body.access === 'private' ? 'private' : 'public'
		const { db } = await getContext(projectId)
		const assets = db.collection('assets')

		const { v4: uuidv4 } = await import('uuid')
		const doc = {
			_id: uuidv4() as any,
			filename: file.originalname,
			mimetype: file.mimetype,
			kind: getKind(file.mimetype),
			size: file.size,
			access,
			path: file.filename,
			uploadedBy: userId || null,
			createdAt: new Date(),
		}

		await assets.insertOne(doc as any)

		res.json({
			success: true,
			asset: {
				id: doc._id,
				filename: doc.filename,
				mimetype: doc.mimetype,
				kind: doc.kind,
				size: doc.size,
				access: doc.access,
				url: `/assets/${doc._id}`,
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

		if (doc.access === 'private') {
			const user = (req as any).user as { permissions?: Record<string, { read?: boolean; write?: boolean }> } | null
			const queryToken = req.query.token as string | undefined

			if (!user && !queryToken) {
				res.status(401).json({ error: 'Authentication required' })
				return
			}

			let allowed = false
			if (user) {
				allowed = hasPermission(user.permissions, 'assets', 'read')
			}
			if (!allowed && queryToken) {
				try {
					const payload = verifyToken(queryToken, config.userJwtSecret) as { permissions?: Record<string, { read?: boolean; write?: boolean }> }
					allowed = hasPermission(payload?.permissions, 'assets', 'read')
				} catch {
					allowed = false
				}
			}
			if (!allowed) {
				res.status(403).json({ error: 'Permission denied: assets:read' })
				return
			}
		}

		const filePath = join(UPLOADS_DIR, doc.path as string)
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

assetsRouter.delete('/:id', requireUser, requirePermission('assets', 'write'), async (req, res) => {
	try {
		const projectId = (req as any).projectId as string
		const { db } = await getContext(projectId)
		const assets = db.collection('assets')

		const doc = await assets.findOne({ _id: req.params.id as any })
		if (!doc) {
			res.status(404).json({ error: 'Asset not found' })
			return
		}

		const filePath = join(UPLOADS_DIR, doc.path as string)
		if (existsSync(filePath)) {
			unlinkSync(filePath)
		}

		await assets.deleteOne({ _id: req.params.id as any })

		res.json({ success: true, message: 'Asset deleted' })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

import { Router, type Router as RouterType } from 'express'
import { getContext } from '../services/db'
import { verifyToken } from '../services/auth'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import { config } from '../config'

export const projectRouter: RouterType = Router()

projectRouter.use((req, res, next) => {
	const auth = req.headers.authorization as string
	if (!auth) {
		res.status(401).json({ error: 'Authorization required' })
		return
	}
	try {
		const token = auth.replace('Bearer ', '').trim()
		const payload = verifyToken(token, config.accountJwtSecret)
    ;(req as any).accountId = payload.id
		next()
	} catch {
		res.status(401).json({ error: 'Invalid token' })
	}
})

projectRouter.post('/create', async (req, res) => {
	try {
		const accountId = (req as any).accountId
		const { name, description } = req.body
		const { db } = await getContext('default')
		const projects = db.collection('projects')
		const origins = db.collection('origins')
		const accounts = db.collection('accounts')

		const _id = uuidv4()
		const token = jwt.sign({ projectId: _id, accountId }, config.accountJwtSecret)

		await projects.insertOne({
			_id,
			name,
			description,
			accountId,
			token,
			status: 'active',
			createdAt: new Date(),
		} as any)

		const originUrl = req.headers.origin as string
		if (originUrl) {
			await origins.insertOne({
				_id: uuidv4(),
				url: originUrl,
				projectId: _id,
				status: 'active',
				createdAt: new Date(),
			} as any)
		}

		const RoleModel = db.collection('roles')
		const PermissionModel = db.collection('permissions')
		const UserModel = db.collection('users')

		const allPermission = await PermissionModel.insertOne({
			_id: uuidv4(),
			name: 'all_access',
			description: 'Full administrative access (*) to all resources',
			read: true,
			write: true,
			resources: [ '*' ],
		} as any)

		const adminRole = await RoleModel.insertOne({
			_id: uuidv4(),
			name: 'admin',
			description: 'Project Administrator with full privileges',
			permissions: [ allPermission.insertedId ],
		} as any)

		const creatorAccount = await accounts.findOne({ _id: accountId })
		if (creatorAccount) {
			await UserModel.insertOne({
				_id: uuidv4(),
				email: creatorAccount.email,
				password: creatorAccount.password,
				name: creatorAccount.name,
				roles: [ adminRole.insertedId ],
				firstLogin: false,
			} as any)
		}

		res.json({ _id, name, description, token, status: 'active', message: 'Project created successfully' })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

projectRouter.get('/list', async (req, res) => {
	try {
		const accountId = (req as any).accountId
		const { db } = await getContext('default')
		const projects = db.collection('projects')
		const list = await projects.find({ accountId }).toArray()
		res.json(list)
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

projectRouter.get('/:id', async (req, res) => {
	try {
		const accountId = (req as any).accountId
		const { id } = req.params
		const { db } = await getContext('default')
		const projects = db.collection('projects')
		const project = await projects.findOne({ _id: id, accountId })
		if (!project) {
			res.status(404).json({ error: 'Project not found' })
			return
		}
		res.json(project)
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

projectRouter.get('/:id/token', async (req, res) => {
	try {
		const accountId = (req as any).accountId
		const { id } = req.params
		const { db } = await getContext('default')
		const projects = db.collection('projects')
		const project = await projects.findOne({ _id: id, accountId }, { projection: { token: 1 } })
		if (!project) {
			res.status(404).json({ error: 'Project not found' })
			return
		}
		res.json({ token: project.token })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

projectRouter.patch('/:id', async (req, res) => {
	try {
		const accountId = (req as any).accountId
		const { id } = req.params
		const { name, description } = req.body
		const { db } = await getContext('default')
		const projects = db.collection('projects')
		const update: Record<string, string> = {}
		if (name !== undefined) update.name = name
		if (description !== undefined) update.description = description
		const result = await projects.updateOne({ _id: id, accountId }, { $set: update })
		if (result.matchedCount === 0) {
			res.status(404).json({ error: 'Project not found' })
			return
		}
		res.json({ success: true, message: 'Project updated successfully' })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

projectRouter.patch('/:id/token', async (req, res) => {
	try {
		const accountId = (req as any).accountId
		const { id } = req.params
		const { db } = await getContext('default')
		const projects = db.collection('projects')
		const token = jwt.sign({ id, accountId }, config.accountJwtSecret)
		const result = await projects.updateOne({ _id: id, accountId }, { $set: { token } })
		if (result.matchedCount === 0) {
			res.status(404).json({ error: 'Project not found' })
			return
		}
		res.json({ token, message: 'Token regenerated successfully' })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

projectRouter.patch('/:id/status', async (req, res) => {
	try {
		const accountId = (req as any).accountId
		const { id } = req.params
		const { status } = req.body
		const { db } = await getContext('default')
		const projects = db.collection('projects')
		const result = await projects.updateOne({ _id: id, accountId }, { $set: { status } })
		if (result.matchedCount === 0) {
			res.status(404).json({ error: 'Project not found' })
			return
		}
		res.json({ status, message: 'Status updated successfully' })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

projectRouter.get('/:id/origins', async (req, res) => {
	try {
		const accountId = (req as any).accountId
		const { id } = req.params
		const { db } = await getContext('default')
		const projects = db.collection('projects')
		const project = await projects.findOne({ _id: id, accountId })
		if (!project) {
			res.status(404).json({ error: 'Project not found' })
			return
		}
		const origins = db.collection('origins')
		const list = await origins.find({ projectId: id }).toArray()
		res.json(list)
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

projectRouter.post('/:id/origins', async (req, res) => {
	try {
		const accountId = (req as any).accountId
		const { id } = req.params
		const { url } = req.body
		const { db } = await getContext('default')
		const projects = db.collection('projects')
		const project = await projects.findOne({ _id: id, accountId })
		if (!project) {
			res.status(404).json({ error: 'Project not found' })
			return
		}
		const origins = db.collection('origins')
		const origin = await origins.insertOne({
			_id: uuidv4(),
			url,
			projectId: id,
			status: 'active',
			createdAt: new Date(),
		} as any)
		res.json({ _id: origin.insertedId, url, message: 'Origin added successfully' })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

projectRouter.delete('/:id/origins/:originId', async (req, res) => {
	try {
		const accountId = (req as any).accountId
		const { id, originId } = req.params
		const { db } = await getContext('default')
		const projects = db.collection('projects')
		const project = await projects.findOne({ _id: id, accountId })
		if (!project) {
			res.status(404).json({ error: 'Project not found' })
			return
		}
		const origins = db.collection('origins')
		await origins.deleteOne({ _id: originId, projectId: id })
		res.json({ success: true, message: 'Origin removed successfully' })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

projectRouter.get('/:id/email-settings', async (req, res) => {
	try {
		const accountId = (req as any).accountId
		const { id } = req.params
		const { db } = await getContext('default')
		const projects = db.collection('projects')
		const project = await projects.findOne({ _id: id, accountId })
		if (!project) {
			res.status(404).json({ error: 'Project not found' })
			return
		}
		const emailSettings = db.collection('email_settings')
		const settings = await emailSettings.findOne({ projectId: id })
		res.json(settings || { email: '', token: '' })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

projectRouter.post('/:id/email-settings', async (req, res) => {
	try {
		const accountId = (req as any).accountId
		const { id } = req.params
		const { email, token } = req.body
		const { db } = await getContext('default')
		const projects = db.collection('projects')
		const project = await projects.findOne({ _id: id, accountId })
		if (!project) {
			res.status(404).json({ error: 'Project not found' })
			return
		}
		const emailSettings = db.collection('email_settings')
		await emailSettings.updateOne(
			{ projectId: id },
			{ $set: { email: email || '', token: token || '' } },
			{ upsert: true }
		)
		res.json({ email, token, message: 'Email settings saved successfully' })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

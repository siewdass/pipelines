import { Router, type Router as RouterType } from 'express'
import { getContext } from '../services/db'
import { verifyToken } from '../services/auth'
import { config } from '../config'
import { v4 as uuidv4 } from 'uuid'

export const userRouter: RouterType = Router()

userRouter.use((req, res, next) => {
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

userRouter.use((req, res, next) => {
	const auth = req.headers.authorization as string
	if (!auth) {
		next()
		return
	}
	try {
		const token = auth.replace('Bearer ', '').trim()
		const payload = verifyToken(token, config.userJwtSecret)
    ;(req as any).userId = payload.id
		next()
	} catch {
		next()
	}
})

userRouter.post('/roles/permissions', async (req, res) => {
	try {
		const projectId = (req as any).projectId
		const { db } = await getContext(projectId)
		const permissions = db.collection('permissions')
		const { name, resources, read, write } = req.body
		if (resources?.includes('*')) {
			res.status(403).json({ error: 'Wildcard (*) resource is reserved for the initial all_access permission' })
			return
		}
		const exists = await permissions.findOne({ name })
		if (exists) {
			res.status(409).json({ error: 'Permission already exists' })
			return
		}
		const permission = await permissions.insertOne({
			_id: uuidv4(),
			name,
			resources,
			read: read ?? false,
			write: write ?? false,
		} as any)
		res.json({ success: true, id: permission.insertedId })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

userRouter.get('/roles/permissions', async (req, res) => {
	try {
		const projectId = (req as any).projectId
		const { db } = await getContext(projectId)
		const permissions = db.collection('permissions')
		const list = await permissions.find().toArray()
		res.json({ success: true, permissions: list })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

userRouter.patch('/roles/permissions/:id', async (req, res) => {
	try {
		const projectId = (req as any).projectId
		const { id } = req.params
		const { db } = await getContext(projectId)
		const permissions = db.collection('permissions')
		const result = await permissions.updateOne({ _id: id }, { $set: req.body })
		if (result.matchedCount === 0) {
			res.status(404).json({ error: 'Permission not found' })
			return
		}
		const updated = await permissions.findOne({ _id: id })
		res.json({ success: true, permission: updated })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

userRouter.delete('/roles/permissions/:id', async (req, res) => {
	try {
		const projectId = (req as any).projectId
		const { id } = req.params
		const { db } = await getContext(projectId)
		const permissions = db.collection('permissions')
		await permissions.deleteOne({ _id: id })
		res.json({ success: true })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

userRouter.post('/roles', async (req, res) => {
	try {
		const projectId = (req as any).projectId
		const { db } = await getContext(projectId)
		const roles = db.collection('roles')
		const { name, description, permissions } = req.body
		const exists = await roles.findOne({ name })
		if (exists) {
			res.status(409).json({ error: 'Role already exists' })
			return
		}
		const role = await roles.insertOne({
			_id: uuidv4(),
			name,
			description,
			permissions,
		} as any)
		res.json({ success: true, id: role.insertedId })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

userRouter.get('/roles', async (req, res) => {
	try {
		const projectId = (req as any).projectId
		const { db } = await getContext(projectId)
		const roles = db.collection('roles')
		const list = await roles.find().toArray()
		res.json({ success: true, roles: list })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

userRouter.patch('/roles/:id', async (req, res) => {
	try {
		const projectId = (req as any).projectId
		const { id } = req.params
		const { db } = await getContext(projectId)
		const roles = db.collection('roles')
		const result = await roles.updateOne({ _id: id }, { $set: req.body })
		if (result.matchedCount === 0) {
			res.status(404).json({ error: 'Role not found' })
			return
		}
		const updated = await roles.findOne({ _id: id })
		res.json({ success: true, role: updated })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

userRouter.delete('/roles/:id', async (req, res) => {
	try {
		const projectId = (req as any).projectId
		const { id } = req.params
		const { db } = await getContext(projectId)
		const roles = db.collection('roles')
		await roles.deleteOne({ _id: id })
		res.json({ success: true })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

userRouter.post('/', async (req, res) => {
	try {
		const projectId = (req as any).projectId
		const { db } = await getContext(projectId)
		const users = db.collection('users')
		const { email, name } = req.body
		const exists = await users.findOne({ email })
		if (exists) {
			res.status(409).json({ error: 'User already exists' })
			return
		}
		const user = await users.insertOne({
			_id: uuidv4(),
			email,
			name,
			firstLogin: true,
		} as any)
		res.json({ success: true, id: user.insertedId })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

userRouter.get('/', async (req, res) => {
	try {
		const projectId = (req as any).projectId
		const { db } = await getContext(projectId)
		const users = db.collection('users')
		const list = await users.find({}, { projection: { password: 0 } }).toArray()
		res.json({ success: true, users: list })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

userRouter.get('/:id', async (req, res) => {
	try {
		const projectId = (req as any).projectId
		const { id } = req.params
		const { db } = await getContext(projectId)
		const users = db.collection('users')
		const user = await users.findOne({ _id: id }, { projection: { password: 0 } })
		if (!user) {
			res.status(404).json({ error: 'User not found' })
			return
		}
		res.json({ success: true, user })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

userRouter.patch('/:id', async (req, res) => {
	try {
		const projectId = (req as any).projectId
		const { id } = req.params
		const { db } = await getContext(projectId)
		const users = db.collection('users')
		const result = await users.updateOne({ _id: id }, { $set: req.body })
		if (result.matchedCount === 0) {
			res.status(404).json({ error: 'User not found' })
			return
		}
		const updated = await users.findOne({ _id: id }, { projection: { password: 0 } })
		res.json({ success: true, user: updated })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

userRouter.delete('/:id', async (req, res) => {
	try {
		const projectId = (req as any).projectId
		const { id } = req.params
		const { db } = await getContext(projectId)
		const users = db.collection('users')
		await users.deleteOne({ _id: id })
		res.json({ success: true })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

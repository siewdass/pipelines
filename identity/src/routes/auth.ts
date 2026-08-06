import { Router, type Router as RouterType } from 'express'
import { getContext } from '../services/db'
import { hashPassword, comparePassword, generateToken, flattenPermissions } from '../services/auth'

export const authRouter: RouterType = Router()

authRouter.post('/signup', async (req, res) => {
	try {
		const projectId = (req as any).projectId as string
		const { email, password, name } = req.body
		const { db } = await getContext(projectId)
		const users = db.collection('users')

		const existing = await users.findOne({ email })
		if (existing) {
			res.status(409).json({ error: 'User already exists' })
			return
		}

		const hashed = await hashPassword(password)
		const { v4: uuidv4 } = await import('uuid')
		await users.insertOne({
			_id: uuidv4() as any,
			email,
			password: hashed,
			name,
			roles: [],
			firstLogin: true,
			createdAt: new Date(),
		} as any)

		res.json({ success: true, message: 'Register success' })
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

authRouter.post('/signin', async (req, res) => {
	try {
		const projectId = (req as any).projectId as string
		const { email, password } = req.body
		const { db } = await getContext(projectId)
		const users = db.collection('users')

		const found = await users.findOne({ email })
		if (!found) {
			res.status(401).json({ error: 'Invalid credentials' })
			return
		}

		const wasFirstLogin = found.firstLogin === true
		if (!found.password) {
			const hashed = await hashPassword(password)
			await users.updateOne({ _id: found._id as any }, { $set: { password: hashed } })
		} else {
			const match = await comparePassword(password, found.password)
			if (!match) {
				res.status(401).json({ error: 'Invalid credentials' })
				return
			}
		}

		if (wasFirstLogin) {
			await users.updateOne({ _id: found._id as any }, { $set: { firstLogin: false } })
		}

		const permissions = await flattenPermissions(projectId, found.roles || [])
		const token = generateToken({ id: found._id, email: found.email, permissions }, 'user')

		res.json({
			success: true,
			message: 'Login success',
			token,
			user: {
				id: found._id,
				email: found.email,
				name: found.name,
				permissions,
				firstLogin: wasFirstLogin,
			},
		})
	} catch (err: any) {
		res.status(400).json({ error: err.message })
	}
})

import { Router, type Router as RouterType } from 'express'
import { getContext } from '../services/db'
import { hashPassword, comparePassword, generateToken } from '../services/auth'

export const authRouter: RouterType = Router()

authRouter.post('/account/register', async (req, res) => {
  try {
    const { email, password, name } = req.body
    const { db } = await getContext('default')
    const accounts = db.collection('accounts')

    const existing = await accounts.findOne({ email })
    if (existing) {
      res.status(409).json({ error: 'Account already exists' })
      return
    }

    const hashed = await hashPassword(password)
    const { v4: uuidv4 } = await import('uuid')
    await accounts.insertOne({
      _id: uuidv4() as any,
      email,
      password: hashed,
      name,
      createdAt: new Date(),
    } as any)

    res.json({ success: true, message: 'Register success' })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

authRouter.post('/account/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const { db } = await getContext('default')
    const accounts = db.collection('accounts')

    const found = await accounts.findOne({ email })
    if (!found) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const match = await comparePassword(password, found.password)
    if (!match) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const token = generateToken({ id: found._id, email: found.email }, 'account')

    res.json({
      success: true,
      message: 'Login success',
      token,
      user: { email: found.email, name: found.name },
    })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

authRouter.post('/recover', async (req, res) => {
  res.json({ success: true, message: 'Recover success' })
})

authRouter.patch('/save', async (req, res) => {
  res.json({ success: true, message: 'Recover success' })
})

authRouter.post('/reset', async (req, res) => {
  res.json({ success: true, message: 'Reset success' })
})

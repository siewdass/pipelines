import express from 'express'
import rateLimit from 'express-rate-limit'
import { config } from './config'
import { projectMiddleware } from './middleware/project'
import { userMiddleware } from './middleware/user'
import { authRouter } from './routes/auth'
import { userRouter } from './routes/user'

const app = express()

app.use(express.json())

const authLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 5,
	message: { error: 'Too many attempts, try again later' }
})

app.use((_req, res, next) => {
	const origin = _req.headers.origin || 'http://localhost:4003'
	res.setHeader('Access-Control-Allow-Origin', origin)
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,project-id,x-project-id')
	res.setHeader('Access-Control-Allow-Credentials', 'true')
	if (_req.method === 'OPTIONS') {
		res.status(204).end()
		return
	}
	next()
})

app.use('/auth/signup', authLimiter)
app.use('/auth/signin', authLimiter)
app.use('/auth', projectMiddleware, authRouter)
app.use('/user', projectMiddleware, userMiddleware, userRouter)

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error('[Identity] Error:', err.message)
	res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(config.port, () => {
	console.log(`[Identity] API running on http://0.0.0.0:${config.port}`)
})

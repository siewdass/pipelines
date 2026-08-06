import express from 'express'
import { config } from './config'
import { projectMiddleware } from './middleware/project'
import { userMiddleware } from './middleware/user'
import { assetsRouter } from './routes/assets'

const app = express()

app.use(express.json())

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

app.use('/assets', projectMiddleware, userMiddleware, assetsRouter)

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error('[Assets] Error:', err.message)
	res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(config.port, () => {
	console.log(`[Assets] API running on http://0.0.0.0:${config.port}`)
})

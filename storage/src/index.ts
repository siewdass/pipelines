import express from 'express'
import { createServer } from 'http'
import { config } from './config'
import { projectMiddleware } from './middleware/project'
import { userMiddleware } from './middleware/user'
import { inquiryRouter } from './routes/inquiry'
import { mutationRouter } from './routes/mutation'
import { authRouter } from './routes/auth'
import { assetsRouter } from './routes/assets'
import { setupRealtime } from './services/realtime-gateway'

const app = express()
const httpServer = createServer(app)

app.use(express.json())

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,project-id,x-project-id')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  if (_req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  next()
})

app.use('/auth', projectMiddleware, authRouter)
app.use('/inquiry', projectMiddleware, userMiddleware, inquiryRouter)
app.use('/mutation', projectMiddleware, userMiddleware, mutationRouter)
app.use('/assets', projectMiddleware, userMiddleware, assetsRouter)

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Storage] Error:', err.message)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

setupRealtime(httpServer)

httpServer.listen(config.port, () => {
  console.log(`[Storage] API running on http://0.0.0.0:${config.port}`)
})

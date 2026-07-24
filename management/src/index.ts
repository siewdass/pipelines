import express from 'express'
import { config } from './config'
import { authRouter } from './routes/auth'
import { projectRouter } from './routes/project'
import { userRouter } from './routes/user'
import { databaseRouter } from './routes/database'
import { sourceRouter } from './routes/source'
import { assembleRouter } from './routes/assemble'

const app = express()

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

app.use('/authentication', authRouter)
app.use('/project', projectRouter)
app.use('/user', userRouter)
app.use('/database', databaseRouter)
app.use('/source', sourceRouter)
app.use('/assemble', assembleRouter)

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Management] Error:', err.message)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(config.port, () => {
  console.log(`[Management] API running on http://0.0.0.0:${config.port}`)
})

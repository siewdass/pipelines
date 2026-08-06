import { createServer } from 'http'
import { config } from './config'
import { setupRealtime } from './services/realtime'

const httpServer = createServer((req, res) => {
	if (req.url === '/health') {
		res.writeHead(200, { 'Content-Type': 'application/json' })
		res.end(JSON.stringify({ status: 'ok' }))
		return
	}
	res.writeHead(404)
	res.end()
})

setupRealtime(httpServer)

httpServer.listen(config.port, () => {
	console.log(`[Events] Realtime running on http://0.0.0.0:${config.port}`)
})

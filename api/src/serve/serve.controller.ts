// import { Controller, Get, Res, Req, UseGuards, NotFoundException, Logger } from '@nestjs/common'
// import type { Response, Request } from 'express'
// import { createReadStream, existsSync } from 'node:fs'
// import { join } from 'node:path'
// import * as jwt from 'jsonwebtoken'
// import { BuildService } from '../build/build.service'
// import { ServeGuard } from './serve.guard'

// @Controller('serve')
// export class ServeController {
// 	private readonly logger = new Logger(ServeController.name)
// 	constructor(private readonly buildService: BuildService) {}

// 	private getBaseUrl(req: Request): string {
// 		const protocol = req.headers['x-forwarded-proto'] || 'http'
// 		const host = req.headers.host || 'localhost:8000'
// 		return `${protocol}://${host}`
// 	}

// 	@Get('loader.js')
// 	async serveLoader(@Req() req: Request, @Res() res: Response) {
// 		const token = req.query['project-id'] as string
// 		let decodedProjectId = 'unknown'
// 		try {
// 			const payload = jwt.decode(token) as { id?: string; projectId?: string }
// 			decodedProjectId = payload?.projectId || payload?.id || 'unknown'
// 		} catch {}
// 		const baseUrl = this.getBaseUrl(req)
// 		const loaderScript = `...`
// 		res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
// 		res.setHeader('Access-Control-Allow-Origin', '*')
// 		return res.send(loaderScript)
// 	}

// 	@Get('html')
// 	async serveHTML(@Req() req: Request, @Res() res: Response) {
// 		const token = req.query['project-id'] as string
// 		if (!token) { res.status(400); return res.send('<h1>Missing project-id</h1>') }
// 		const baseUrl = this.getBaseUrl(req)
// 		const html = `...`
// 		res.setHeader('Content-Type', 'text/html; charset=utf-8')
// 		res.setHeader('Access-Control-Allow-Origin', '*')
// 		return res.send(html)
// 	}

// 	@Get('runtime.js')
// 	async serveRuntime(@Req() req: Request, @Res() res: Response) {
// 		const runtimePath = join(process.cwd(), '../runtime/dist/runtime.js')
// 		if (!existsSync(runtimePath)) throw new NotFoundException('Runtime engine build not found.')
// 		res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
// 		res.setHeader('Cache-Control', 'public, max-age=3600')
// 		res.setHeader('Access-Control-Allow-Origin', '*')
// 		const file = createReadStream(runtimePath)
// 		return file.pipe(res)
// 	}

// 	@Get()
// 	@UseGuards(ServeGuard)
// 	async serveProjectJs(@Req() req: Request & { projectId: string }, @Res() res: Response) {
// 		const build = await this.buildService.get(req.projectId)
// 		res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
// 		res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
// 		res.setHeader('Access-Control-Allow-Origin', '*')
// 		if (!build || !build.code) {
// 			return res.send(`console.error('[Serve] No build found for project ${req.projectId}. Click Build in Studio first.');`)
// 		}
// 		return res.send(build.code)
// 	}
// }

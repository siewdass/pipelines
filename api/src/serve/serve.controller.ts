import { Controller, Get, Res, Req, UseGuards, NotFoundException, Logger } from '@nestjs/common'
import type { Response, Request } from 'express'
import { createReadStream, existsSync } from 'node:fs'
import { join } from 'node:path'
import { AssembleService } from '../assemble/assemble.service'
import { ServeGuard } from './serve.guard'

@Controller('serve')
export class ServeController {
	private readonly logger = new Logger(ServeController.name)
	constructor(private readonly assembleService: AssembleService) {}

	@Get('loader.js')
	async serveLoader(@Req() req: Request & { projectId: string }, @Res() res: Response) {
		const token = req.query['project-id'] as string
		const apiHost = 'http://localhost:8000'

		const loaderScript = `
			(function() {
				window.PIPELINES = "${token}";
				console.log("[Loader] Initializing SDK for Project: ${req.projectId}");
				
				const style = document.createElement('style');
				style.innerHTML = \`
					@keyframes preloader-spin { to { transform: rotate(360deg); } }
					#preloader { transition: opacity 0.5s ease, visibility 0.5s; font-family: 'Outfit', sans-serif; }
				\`;
				document.head.appendChild(style);

				const preloaderHtml = \`
					<div id="preloader" style="position:fixed;inset:0;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;background-color:#000;">
						<div style="width:36px;height:36px;border:3px solid rgba(255,255,255,0.08);border-top-color:#3b82f6;border-radius:50%;animation:preloader-spin 0.8s linear infinite;margin-bottom:28px;"></div>
						<div id="preloader-status" style="font-size:11px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:20px;">Iniciando...</div>
						<div style="width:180px;height:3px;background:rgba(255,255,255,0.06);border-radius:99px;overflow:hidden;margin-bottom:12px;">
							<div id="preloader-bar" style="width:0%;height:100%;background:#3b82f6;border-radius:99px;transition:width 0.4s ease;"></div>
						</div>
						<div id="preloader-pct" style="font-size:10px;font-weight:700;letter-spacing:0.05em;color:rgba(255,255,255,0.5);">0%</div>
					</div>
					<div id="root"></div>
				\`;
				document.body.insertAdjacentHTML('afterbegin', preloaderHtml);

				const scripts = [
					{ src: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&display=swap", type: 'link', name: 'Fonts' },
					{ src: "https://cdn.tailwindcss.com", name: "Tailwind" },
					{ src: "${apiHost}/serve/runtime.js", name: "Engine" },
					{ src: "${apiHost}/serve?project-id=" + window.PIPELINES, name: "App" }
				];

				const status = document.getElementById("preloader-status");
				const bar = document.getElementById("preloader-bar");
				const pctText = document.getElementById("preloader-pct");
				let currentPct = 0; let targetPct = 0; let loadedCount = 0;

				function animFrame() {
					if (currentPct < targetPct) { currentPct++; bar.style.width = currentPct + "%"; pctText.textContent = currentPct + "%"; }
					if (currentPct >= 100) {
						status.textContent = "Listo";
						const preloader = document.getElementById("preloader");
						if (preloader) { preloader.style.opacity = "0"; preloader.style.visibility = "hidden"; setTimeout(() => preloader.remove(), 500); }
						return;
					}
					requestAnimationFrame(animFrame);
				}
				requestAnimationFrame(animFrame);

				scripts.forEach((script) => {
					const onLoaded = () => {
						loadedCount++;
						console.log("[Loader] OK: " + script.name);
						status.textContent = "Cargando " + script.name;
						targetPct = Math.round((loadedCount / scripts.length) * 100);
					};
					const onError = () => {
						loadedCount++;
						console.error("[Loader] FAILED: " + script.name + " (" + script.src + ")");
						targetPct = Math.round((loadedCount / scripts.length) * 100);
					};

					if (script.type === 'link') {
						const el = document.createElement("link"); el.rel = "stylesheet"; el.href = script.src;
						el.onload = onLoaded; el.onerror = onError;
						document.head.appendChild(el); 
					} else {
						const el = document.createElement("script"); el.src = script.src; el.async = false;
						el.onload = onLoaded; el.onerror = onError;
						document.head.appendChild(el);
					}
				});
			})();
		`
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
		return res.send(loaderScript)
	}

	@Get('runtime.js')
	async serveRuntime(@Res() res: Response) {
		const runtimePath = join(process.cwd(), '../runtime/dist/runtime.js')
		
		if (!existsSync(runtimePath)) {
			throw new NotFoundException('Runtime engine build not found. Please run build in runtime directory.')
		}

		res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
		res.setHeader('Cache-Control', 'public, max-age=3600')
		
		const file = createReadStream(runtimePath)
		return file.pipe(res)
	}

	@Get()
	@UseGuards(ServeGuard)
	async serveProjectJs(@Req() req: Request & { projectId: string }, @Res() res: Response) {
		this.logger.log(`[SERVE] Checking build for project ID: ${req.projectId}`)
		let config = await this.assembleService.getConfig(req.projectId)
		
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
		res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
		res.setHeader('Access-Control-Allow-Origin', '*')

		// Si no hay configuración o no hay build, generamos uno por defecto e intentamos compilar
		if (!config || !config.build) {
			this.logger.warn(`[SERVE] Missing build for ${req.projectId}. Generating starter template...`)
			
			const initialSource = config?.source || `
				const App = () => {
					return React.createElement('div', { 
						style: { 
							minHeight: '100vh', display: 'flex', flexDirection: 'column', 
							alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a',
							color: 'white', fontFamily: 'system-ui, sans-serif'
						} 
					}, [
						React.createElement('h1', { style: { fontSize: '4rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-0.05em' } }, 'Pipelines Ready.'),
						React.createElement('p', { style: { opacity: 0.6, fontSize: '1.2rem' } }, 'Project Identity: ${req.projectId}')
					]);
				};
				window.App = App;
			`

			try {
				const build = await this.assembleService.compileReactCode(initialSource)
				
				// Guardamos en DB para la próxima vez
				if (config) {
					config.build = build
					await config.save()
				} else {
					// @ts-ignore
					await this.assembleService.assembleConfigModel.create({
						projectId: req.projectId,
						source: initialSource,
						build: build
					})
				}
				
				this.logger.log(`[SERVE] Auto-compiled starter template for ${req.projectId}`)
				return res.send(build)
			} catch (err) {
				this.logger.error(`[SERVE] Failed to auto-compile: ${err.message}`)
				return res.send(`console.error('[PIPELINES] Failed to auto-compile starter for ${req.projectId}');`)
			}
		}

		this.logger.log(`[SERVE] Serving bundle (${config.build.length} bytes)`)
		return res.send(config.build)
	}
}

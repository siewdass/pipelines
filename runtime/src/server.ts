import express from 'express'
import mongoose from 'mongoose'
import * as jwt from 'jsonwebtoken'
import { createReadStream, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PORT = parseInt(process.env.PORT || '4002', 10)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/default'
const ACCOUNT_JWT_SECRET = process.env.ACCOUNT_JWT_SECRET || 'dev-account-secret'

const app = express()

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,project-id')
  if (_req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  next()
})

function getBaseUrl(req: express.Request): string {
  if (req.query['baseUrl']) {
    return req.query['baseUrl'] as string
  }
  const proto = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers.host || 'localhost:8002'
  return `${proto}://${host}`
}

const serveRouter = express.Router()

serveRouter.get('/runtime.js', (_req, res) => {
  const runtimePath = join(__dirname, '..', 'dist', 'runtime.js')
  if (!existsSync(runtimePath)) {
    res.status(404).send('console.error("[Runtime] Build not found. Run pnpm build first.")')
    return
  }
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  const file = createReadStream(runtimePath)
  file.pipe(res)
})

serveRouter.get('/loader.js', (req, res) => {
  const token = req.query['project-id'] as string
  let decodedProjectId = 'unknown'
  try {
    const payload = jwt.decode(token) as { id?: string; projectId?: string }
    decodedProjectId = payload?.projectId || payload?.id || 'unknown'
  } catch {}

  const baseUrl = getBaseUrl(req)

  const loaderScript = `
(function() {
  for (var key in localStorage) { if (key.indexOf('socket.io') === 0) localStorage.removeItem(key); }
  for (var key in sessionStorage) { if (key.indexOf('socket.io') === 0) sessionStorage.removeItem(key); }
  document.cookie = "io=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  console.log("[Loader] Initializing SDK for Project: ${decodedProjectId}");

  function load() {
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

    var api = window.PIPELINES_API || '${baseUrl}';
    const scripts = [
      { src: "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4", name: "Tailwind" },
      { src: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&display=swap", type: 'link', name: 'Fonts' },
      { src: api + "/serve/runtime.js?v=" + Date.now(), name: "Engine" },
      { src: api + "/serve?project-id=" + window.PIPELINES, name: "App" }
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
        status.textContent = "Cargando " + script.name;
        targetPct = Math.round((loadedCount / scripts.length) * 100);
      };
      const onError = () => {
        loadedCount++;
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
  }

  window.PIPELINES = "${token}";
  load();
})();
`
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
  res.end(loaderScript)
})

serveRouter.get('/html', (req, res) => {
  const token = req.query['project-id'] as string
  if (!token) {
    res.status(400).send('<h1>Missing project-id</h1>')
    return
  }
  const baseUrl = getBaseUrl(req)
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pipelines | App</title>
</head>
<body style="background-color: #000; margin: 0;">
  <script>window.PIPELINES = "${token}"; window.PIPELINES_API = "${baseUrl}";<\/script>
  <script src="${baseUrl}/serve/loader.js?project-id=${token}"><\/script>
</body>
</html>`
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(html)
})

serveRouter.get('/', async (req, res) => {
  const token = req.query['project-id'] as string
  if (!token) {
    res.status(400).send('Missing project-id query parameter')
    return
  }

  try {
    const db = mongoose.connection.useDb('default')

    let decodedProjectId = ''
    try {
      const secret = ACCOUNT_JWT_SECRET
      const payload = jwt.verify(token, secret) as { id?: string; projectId?: string }
      decodedProjectId = payload.projectId || payload.id || ''
      if (!decodedProjectId) throw new Error()
    } catch {
      const payload = jwt.decode(token) as { id?: string; projectId?: string }
      decodedProjectId = payload?.projectId || payload?.id || ''
      if (!decodedProjectId) {
        res.status(403).json({ error: 'Invalid project token payload' })
        return
      }
    }

    const isProduction = process.env.NODE_ENV === 'production'
    const origin = req.headers.origin || req.headers.referer || req.headers.host || 'unknown-origin'
    const originDoc = await db.collection('origins').findOne({ url: origin, projectId: decodedProjectId, status: 'active' })
    if (!originDoc) {
      if (isProduction) {
        res.status(403).json({ error: `Origin ${origin} not registered for this project` })
        return
      }
      console.warn(`[Serve] Origin ${origin} not registered for project ${decodedProjectId}. Allowing anyway (DEV MODE).`)
    }

    const build = await db.collection('builds').findOne({ projectId: decodedProjectId })
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

    if (!build || !build.code) {
      res.send(`console.error('[Serve] No build found for project ${decodedProjectId}. Click Build in Studio first.');`)
      return
    }

    res.send(build.code)
  } catch (err: any) {
    console.error('[Serve] Error serving project:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.use('/serve', serveRouter)

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Runtime] Error:', err.message)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Runtime] API running on http://0.0.0.0:${PORT}`)
})

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 }).catch((err) => {
  console.warn('[Runtime] MongoDB not available — serve route will return errors:', err.message)
})

import express from 'express'
import { config } from './config'
import { getDb } from './db'
import { CATALOG_TYPES } from './types'

const app = express()

app.use(express.json())

app.use((_req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type,project-id,x-project-id')
	if (_req.method === 'OPTIONS') {
		res.status(204).end()
		return
	}
	next()
})

function parseLimit(value: unknown, def: number, max: number): number {
	const n = parseInt(String(value ?? def), 10)
	if (Number.isNaN(n) || n < 0) return def
	return Math.min(n, max)
}

function isCatalogType(type: string): type is (typeof CATALOG_TYPES)[number] {
	return (CATALOG_TYPES as readonly string[]).includes(type)
}

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' })
})

app.get('/', async (req, res, next) => {
	try {
		const type = req.query.type
		if (typeof type === 'string' && !isCatalogType(type)) {
			res.status(404).json({ error: `Unknown catalog type "${type}"` })
			return
		}
		const db = await getDb()
		if (typeof type === 'string') {
			const collection = db.collection(type)
			if (req.query.code !== undefined) {
				const doc = await collection.findOne({ code: req.query.code })
				if (!doc) {
					res.status(404).json({ error: 'Not found' })
					return
				}
				res.json(doc)
				return
			}
			const filter: Record<string, unknown> = {}
			if (req.query.parentCode !== undefined) filter.parentCode = req.query.parentCode
			if (typeof req.query.name === 'string' && req.query.name) {
				filter.name = { $regex: req.query.name, $options: 'i' }
			}
			const limit = parseLimit(req.query.limit, 50, 500)
			const skip = parseLimit(req.query.skip, 0, Number.MAX_SAFE_INTEGER)
			const total = await collection.countDocuments(filter)
			const items = await collection.find(filter).sort({ code: 1 }).skip(skip).limit(limit).toArray()
			res.json({ items, total, limit, skip })
			return
		}
		const counts: Record<string, number> = {}
		for (const t of CATALOG_TYPES) {
			counts[t] = await db.collection(t).countDocuments()
		}
		res.json(counts)
	} catch (err) {
		next(err)
	}
})

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error('[Catalog] Error:', err?.message || err)
	res.status(500).json({ error: err?.message || 'Internal server error' })
})

app.listen(config.port, () => {
	console.log(`[Catalog] API running on http://0.0.0.0:${config.port}`)
})

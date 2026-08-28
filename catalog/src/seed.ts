import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import { config } from './config'
import { getDb } from './db'
import { CATALOG_TYPES, type CatalogDoc } from './types'

const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'data')
const CHUNK = 5000

async function importType(db: Awaited<ReturnType<typeof getDb>>, type: (typeof CATALOG_TYPES)[number]) {
	const docs = JSON.parse(await readFile(path.join(DATA_DIR, `${type}.json`), 'utf8')) as CatalogDoc[]
	const collection = db.collection<CatalogDoc>(type)
	await collection.createIndex({ code: 1 })
	await collection.createIndex({ parentCode: 1 })

	let written = 0
	for (let i = 0; i < docs.length; i += CHUNK) {
		const batch = docs.slice(i, i + CHUNK)
		const result = await collection.bulkWrite(
			batch.map(({ _id, ...rest }) => ({
				replaceOne: { filter: { _id }, replacement: rest, upsert: true }
			})),
			{ ordered: false }
		)
		written += result.upsertedCount + result.modifiedCount
	}
	console.log(`✓ ${type} — ${docs.length} docs (${written} upserted/modified)`)
}

async function main() {
	const db = await getDb()
	for (const type of CATALOG_TYPES) {
		await importType(db, type)
	}
	await mongoose.disconnect()
	console.log(`Seeded catalog → ${config.mongoUri}`)
}

main().catch(async (err) => {
	console.error('Seed failed:', err)
	await mongoose.disconnect()
	process.exit(1)
})

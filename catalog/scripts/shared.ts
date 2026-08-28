import { v5 as uuidv5 } from 'uuid'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const NAMESPACE = 'a1f2c3d4-e5f6-4a5b-9c8d-7e6f5a4b3c2d'

const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'data')

export type CatalogDoc = {
  _id: string
  name: string
  code: string
  parentCode?: string
}

export function catalogId(type: string, code: string): string {
	return uuidv5(`${type}:${code}`, NAMESPACE)
}

export async function writeCatalog(type: string, docs: CatalogDoc[]): Promise<void> {
	await mkdir(DATA_DIR, { recursive: true })
	const sorted = [ ...docs ].sort((a, b) => a.code.localeCompare(b.code))
	const pretty = docs.length < 10000
	const body = pretty ? JSON.stringify(sorted, null, 2) : JSON.stringify(sorted)
	await writeFile(path.join(DATA_DIR, `${type}.json`), body + '\n', 'utf8')
	console.log(`✓ ${type}.json — ${docs.length} docs (${path.join(DATA_DIR, `${type}.json`)})`)
}

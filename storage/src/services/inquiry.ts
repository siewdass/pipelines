import type { Db, Doc } from '../types'

export function getOptions(params: Record<string, any>, key = ''): Record<string, any> {
	const out: any = { filter: {} }
	if (!params) return out

	const source = key ? params[key] : params
	if (!source) return out

	if (source.filter) {
		for (const [ fk, fv ] of Object.entries(source.filter)) {
			if (fk.startsWith('$')) throw new Error('MongoDB operators prohibited')
			if (typeof fv === 'object' && fv !== null && !Array.isArray(fv)) {
				for (const k of Object.keys(fv)) {
					if (k.startsWith('$')) throw new Error('MongoDB operators prohibited')
				}
			}
			if (typeof fv === 'string' && fv.includes('*')) {
				out.filter[fk] = new RegExp('^' + escapeRegExp(fv).replace(/\\\*/g, '.*') + '$', 'i')
			} else if (Array.isArray(fv)) {
				out.filter[fk] = { $in: fv }
			} else {
				out.filter[fk] = fv
			}
		}
	}
	if (source.sort) out.sort = source.sort
	if (source.limit) out.limit = source.limit
	if (source.pagination) {
		out.pagination = {
			page: source.pagination.page || 1,
			limit: source.pagination.limit || 10,
			total: 0,
			pages: 0,
		}
	}
	if (source.list) {
		out.list = { bridge: source.list.bridge, limit: source.list.limit }
	}
	return out
}

export function getProjection(output: Doc) {
	const projection: Record<string, number> = {}
	const nested: Record<string, unknown> = {}
	for (const key in output) {
		if (typeof output[key] === 'object' && output[key] !== null) {
			nested[key] = output[key]
			projection[key] = 1
		} else {
			projection[key] = output[key] as number
		}
	}
	return { projection, nested }
}

export async function upload(
	doc: Doc,
	nestedProjection: Doc,
	db: Db,
	source: string,
	options: Doc,
): Promise<void> {
	for (const [ key, value ] of Object.entries(nestedProjection)) {
		if (!isRecord(value)) continue
		if (doc[key] === undefined) doc[key] = null

		const childCol = db.collection(key)
		const { projection: childProj, nested: childNested } = getProjection(value as Doc)
		const { filter, sort, limit, list } = getOptions(options, key)

		if (list) {
			if (list.bridge && typeof list.bridge === 'string') {
				const parentId = doc._id || doc.id
				const target = list.bridge
				const pivotCollection = `${source}_${target}`
				const pivotCol = db.collection(pivotCollection)

				const collInfo = await db.listCollections({ name: pivotCollection }).toArray()
				if (collInfo.length === 0) {
					doc[key] = []
					continue
				}
				const pivotDocs = await pivotCol.find({ [source]: parentId }).toArray()
				const childIds = pivotDocs.map((p: any) => p[target]).filter(Boolean)
				let childDocs: any[] = []
				if (childIds.length) {
					const q: any = { _id: { $in: childIds } }
					let cursor = childCol.find(q, { projection: childProj }).sort(sort ?? {})
					if (limit) cursor = cursor.limit(limit)
					childDocs = await cursor.toArray()
				}
				for (const childDoc of childDocs) {
					delete childDoc[source]
					if (childNested) {
						await upload(childDoc, childNested as Doc, db, key, options)
					}
				}
				doc[key] = childDocs
			} else {
				const q: any = { ...filter, [source]: doc._id || doc.id }
				let cursor = childCol.find(q, { projection: childProj }).sort(sort ?? {})
				if (limit) cursor = cursor.limit(limit)
				const childDocs = await cursor.toArray()
				for (const childDoc of childDocs) {
					delete childDoc[source]
					if (childNested) {
						await upload(childDoc, childNested as Doc, db, key, options)
					}
				}
				doc[key] = childDocs
			}
		} else {
			const q: any = { ...filter, [source]: doc._id || doc.id }
			const childDoc = await childCol.findOne(q, { projection: childProj, sort: sort ?? {} })
			if (childDoc) {
				delete (childDoc as Doc)[source]
				if (childNested) {
					await upload(childDoc as Doc, childNested as Doc, db, key, options)
				}
				doc[key] = childDoc
			} else {
				doc[key] = null
			}
		}
	}
}

export function serialize(value: any): any {
	if (Array.isArray(value)) return value.map((v) => serialize(v))
	if (value === null || typeof value !== 'object') return value
	if (value instanceof Date) return value.toISOString()
	const out: any = {}
	for (const k of Object.keys(value)) {
		out[k === '_id' ? 'id' : k] = serialize(value[k])
	}
	return out
}

function isRecord(x: unknown): x is Record<string, unknown> {
	return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function escapeRegExp(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

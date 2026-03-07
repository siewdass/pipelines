import { Injectable } from '@nestjs/common'
import * as mongoose from 'mongoose'

type Db = mongoose.mongo.Db
type Map = Record<string, unknown>

type options = {
	filter?: Map,
	sort?: Record<string, 1 | -1>
	list?: {
		bridge?: string
		limit?: number
	},
	pagination?: { page: number; limit: number, total: number; pages: number }
}

@Injectable()
export class InquiryService {

	async upload(doc: Map, projection: Map, db: Db, source: string, options: Map): Promise<void> {
		const { filter, sort, list } = this.getOptions(options ?? {})

		for (const [ key, value ] of Object.entries(projection)) {
			const childCol = db.collection(key)
			// handle only when projection value is a record (nested request)
			if (this.isRecord(value)) {
				const { projection: childProj, nested: childNested } = this.getProjection(value as Map)
				// if list options are present for this child, fetch multiple
				if (list) {
					if (list.bridge && typeof list.bridge === 'string') {
						// Treat list.bridge as the pivot collection name; fallback to `${key}_bridge` when not present
						const pivotCollection = `${key}_${list.bridge}`
						const pivotCol = db.collection(pivotCollection)
						// ensure pivot collection exists before querying
						const collInfo = await db.listCollections({ name: pivotCollection }).toArray()
						if (collInfo.length === 0) {
							// pivot collection missing — treat as no linked children
							doc[key] = []
							continue
						}
						// read pivot rows that link this parent to children
						const pivotDocs = await pivotCol.find({ [source]: doc._id }).toArray()
						const childIds = pivotDocs.map(p => (p as Record<string, unknown>)[key]).filter(Boolean)
						let childDocs: unknown[] = []
						if (childIds.length) {
							// use raw ids from pivot as-is (no validation); cast query to any to satisfy typings
							const q: any = { _id: { $in: childIds } }
							let cursor = childCol.find(q, { projection: childProj }).sort(sort ?? {})
							if (list.limit) cursor = cursor.limit(list.limit)
							childDocs = await cursor.toArray()
						}
						// For bridge/pivot relationships we do not recursively populate children here
						for (const childDoc of childDocs) delete (childDoc as Map)[source]
						doc[key] = childDocs
					} else {
						const q = { ...filter ?? {}, [source]: doc._id }
						let cursor = childCol.find(q, { projection: childProj }).sort(sort ?? {})
						if (list.limit) cursor = cursor.limit(list.limit)
						const childDocs = await cursor.toArray()
						const hasChildNested = Object.keys(childNested).length > 0
						if (hasChildNested) {
							for (const childDoc of childDocs) {
								await this.upload(childDoc, childNested as Map, db, key, options)
							}
						}
						for (const childDoc of childDocs) delete childDoc[source]
						doc[key] = childDocs
					}
				} else {
					const q = { ...filter ?? {}, [source]: doc._id }
					const childDoc = await childCol.findOne(q, { projection: childProj })
					if (childDoc) {
						const hasChildNested = Object.keys(childNested).length > 0
						if (hasChildNested) await this.upload(childDoc, childNested as Map, db, key, options)
						delete childDoc[source]
						doc[key] = childDoc
					}
				}
			}
		}
	}

	getProjection(output: Map) {
		const projection: Record<string, number> = {}
		const nested: Record<string, unknown> = {}
		// Separate projection into root-level fields and nested objects
		for (const key in output) {
			if (typeof output[key] === 'object' && output[key] !== null) {
				nested[key] = output[key]
			} else {
				projection[key] = output[key] as number
			}
		}
		return { projection, nested }
	}

	serialize(value: any): any {
		if (value === null || value === undefined) return value
		if (Array.isArray(value)) return value.map(v => this.serialize(v))
		if (value instanceof Date) return value.toISOString()
		if (typeof value === 'object') {
			const out: any = {}
			for (const [ k, v ] of Object.entries(value)) {
				const key = k === '_id' ? 'id' : k
				if (v && typeof v === 'object' && typeof (v as any).toHexString === 'function') {
					// likely an ObjectId
					out[key] = (v as any).toString()
				} else {
					out[key] = this.serialize(v)
				}
			}
			return out
		}
		return value
	}

	escapeRegExp(str: string): string {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	}

	tryParseDate(value: unknown): Date | null {
		if (typeof value !== 'string') return null
		const ts = Date.parse(value)
		return Number.isNaN(ts) ? null : new Date(ts)
	}

	coerceValue(_key: string, value: unknown): unknown {
		if (typeof value === 'string') {
			const d = this.tryParseDate(value)
			if (d) return d
		}
		return value
	}

	isRecord(x: unknown): x is Record<string, unknown> {
		return x !== null && typeof x === 'object' && !Array.isArray(x)
	}

	accentPattern(input: string): string {
		const map: Record<string, string> = {
			a: 'aá',
			e: 'eé',
			i: 'ií',
			o: 'oó',
			u: 'uú',
			n: 'nñ'
		}
		return Array.from(input).map(ch => {
			const lower = ch.toLowerCase()
			if (map[lower]) return '[' + map[lower] + ']'
			return this.escapeRegExp(ch)
		}).join('')
	}

	isAcceptableInput(input: string): boolean {
		for (const ch of Array.from(input)) {
			const normalized = ch.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
			const base = normalized.length ? normalized[0] : ''
			// allow a-z, 0-9, space, hyphen, apostrophe
			if (!/^[a-z0-9 \-']$/i.test(base)) return false
		}
		return true
	}

	getOptions(params: Record<string, unknown>): options {
		const out: options = {}
		if ('filter' in params && this.isRecord(params['filter'])) {
			out.filter = {}
			const metaFilter = params['filter'] as Record<string, unknown>
			for (const [ field, op ] of Object.entries(metaFilter)) {
				if (op == null) continue
				if (!this.isRecord(op)) continue
				const obj = op as Record<string, unknown>
				// normalize common misspellings/aliases so clients with typos still work
				if ('constains' in obj && !('contains' in obj)) {
					obj['contains'] = obj['constains']
					delete obj['constains']
				}
				if ('equals' in obj && !('equal' in obj)) {
					obj['equal'] = obj['equals']
					delete obj['equals']
				}
				if ('eq' in obj && !('equal' in obj)) {
					obj['equal'] = obj['eq']
					delete obj['eq']
				}

				if ('equal' in obj) {
					const v = obj['equal']
					if (typeof v === 'string') {
						if (!this.isAcceptableInput(String(v))) continue
						const pat = '^' + this.accentPattern(String(v)) + '$'
						out.filter[field] = { $regex: pat, $options: 'i' }
					} else {
						out.filter[field] = { $eq: this.coerceValue(field, v) }
					}
					continue
				}

				if ('contains' in obj) {
					const val = obj['contains']
					const arr = Array.isArray(val) ? val : [ val ]
					if (arr.every(a => typeof a === 'string')) {
						if (arr.some(a => !this.isAcceptableInput(String(a)))) continue
						const regexes = arr.map(a => new RegExp('^' + this.escapeRegExp(String(a)) + '$', 'i'))
						if (obj['not']) out.filter[field] = { $nin: regexes }
						else out.filter[field] = { $in: regexes }
					} else {
						const mapped = arr.map(v => this.coerceValue(field, v))
						if (obj['not']) out.filter[field] = { $nin: mapped }
						else out.filter[field] = { $in: mapped }
					}
					continue
				}

				if ('range' in obj) {
					const r: Record<string, unknown> = {}
					const rr = obj['range']
					if (this.isRecord(rr)) {
						if ('min' in rr) r['$gte'] = this.coerceValue(field, rr['min'])
						if ('max' in rr) r['$lte'] = this.coerceValue(field, rr['max'])
					}
					if (Object.keys(r).length) out.filter[field] = r
					continue
				}

				if ('phrase' in obj) {
					const raw = obj['phrase']
					let s = String(raw ?? '')
					if (s.length > 100) s = s.slice(0, 100)
					if (!this.isAcceptableInput(s)) continue
					const pat = this.accentPattern(s)
					out.filter[field] = { $regex: pat, $options: 'i' }
					continue
				}
			}
		}

		if ('pagination' in params) {
			const p = params['pagination'] as Record<string, unknown> | undefined
			if (p && this.isRecord(p)) {
				const { page, limit } = p
				if (typeof page === 'number' && typeof limit === 'number' && page > 0 && limit > 0) {
					out.pagination = { page, limit, total: 0, pages: 0 }
				}
			}
		}

		if ('list' in params && this.isRecord(params['list'])) {
			out.list = {}
			const listRec = params['list'] as Record<string, unknown>
			// allow a bridge name and a per-list limit
			if ('bridge' in listRec && typeof listRec['bridge'] === 'string') {
				out.list.bridge = listRec['bridge'] as string
			}
			if ('limit' in listRec && typeof listRec['limit'] === 'number' && listRec['limit'] > 0) {
				out.list.limit = listRec['limit'] as number
			}
			const sortReq = listRec['sort']
			if (this.isRecord(sortReq)) {
				const sortMap: Record<string, 1 | -1> = {}
				for (const [ k, v ] of Object.entries(sortReq as Record<string, unknown>)) {
					if (typeof v === 'string') {
						const low = v.toLowerCase()
						if (low === 'asc') sortMap[k] = 1
						else if (low === 'desc') sortMap[k] = -1
					}
				}
				if (Object.keys(sortMap).length) out.sort = sortMap
			}
		}
		
		return out
	}

}
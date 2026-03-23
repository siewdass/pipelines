import { Injectable, Logger } from '@nestjs/common'
import { Db, Doc } from '../mutation/mutation.type'

@Injectable()
export class InquiryService {
	private readonly logger = new Logger(InquiryService.name)

	async upload(doc: Doc, nestedProjection: Doc, db: Db, source: string, options: Doc): Promise<void> {
		this.logger.log(`[INQUIRY] Starting upload for ${source}. ${`ParentId: ${doc._id || doc.id}`}`)
		for (const [key, value] of Object.entries(nestedProjection)) {
			if (!this.isRecord(value)) continue
			
			
			this.logger.log(`[INQUIRY] Processing nested key: ${key}`)
			// Initialize the field in the document if it's missing (needed for expansion)
			if (doc[key] === undefined) {
				this.logger.log(`[INQUIRY] Initializing key ${key} to null in doc`)
				doc[key] = null
			}

			const childCol = db.collection(key)
			const { projection: childProj, nested: childNested } = this.getProjection(value as Doc)
			const { filter, sort, limit, list } = this.getOptions(options, key)
			
			if (list) {
				if (list.bridge && typeof list.bridge === 'string') {
					const parentId = doc._id || doc.id
					const target = list.bridge
					const pivotCollection = `${source}_${target}`
					const pivotCol = db.collection(pivotCollection)

					this.logger.log(`[INQUIRY] Many-to-many: ${source} -> ${target} via ${pivotCollection}`)
					const collInfo = await db.listCollections({ name: pivotCollection }).toArray()
					if (collInfo.length === 0) {
						this.logger.log(`[INQUIRY] Pivot ${pivotCollection} missing`)
						doc[key] = []
						continue
					}

					const pivotDocs = await pivotCol.find({ [source]: parentId }).toArray()
					this.logger.log(`[INQUIRY] Found ${String(pivotDocs.length)} relations for ${parentId}`)
					const childIds = pivotDocs.map((p) => (p as Doc)[target]).filter(Boolean)
					let childDocs: unknown[] = []
					if (childIds.length) {
						const q: any = { _id: { $in: childIds } }
						let cursor = childCol.find(q, { projection: childProj }).sort(sort ?? {})
						if (list.limit) cursor = cursor.limit(list.limit)
						childDocs = await cursor.toArray()
						this.logger.log(`[INQUIRY] Fetched ${String(childDocs.length)} children from ${key}`)
					}

					for (const childDoc of childDocs) {
						delete (childDoc as Doc)[source]
						if (childNested) {
							await this.upload(childDoc as Doc, childNested as Doc, db, key, options)
						}
					}
					doc[key] = childDocs
				} else {
					this.logger.log(`[INQUIRY] One-to-many lookup for ${key}`)
					const q: any = { ...filter, [source]: doc._id || doc.id }
					let cursor = childCol.find(q, { projection: childProj }).sort(sort ?? {})
					if (list.limit) cursor = cursor.limit(list.limit)
					const childDocs = await cursor.toArray()

					for (const childDoc of childDocs) {
						delete (childDoc as Doc)[source]
						if (childNested) {
							await this.upload(childDoc as Doc, childNested as Doc, db, key, options)
						}
					}
					doc[key] = childDocs
				}
			} else {
				this.logger.log(`[INQUIRY] One-to-one lookup for ${key}`)
				const q: any = { ...filter, [source]: doc._id || doc.id }
				const childDoc = await childCol.findOne(q, { projection: childProj, sort: sort ?? {} })
				if (childDoc) {
					delete (childDoc as Doc)[source]
					if (childNested) {
						await this.upload(childDoc as Doc, childNested as Doc, db, key, options)
					}
					doc[key] = childDoc
				} else {
					doc[key] = null
				}
			}
		}
	}

	getProjection(output: Doc) {
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

	serialize(value: any): any {
		if (Array.isArray(value)) return value.map(v => this.serialize(v))
		if (value === null || typeof value !== 'object') return value
		if (value instanceof Date) return value.toISOString()

		const out: any = {}
		const keys = Object.keys(value)
		for (const k of keys) {
			const key = k === '_id' ? 'id' : k
			out[key] = this.serialize(value[k])
		}
		return out
	}

	getOptions(params: Record<string, any>, key: string = ''): { filter?: any; sort?: any; limit?: number; list?: { bridge?: string; limit?: number }; pagination?: { page: number; limit: number; total: number; pages: number } } {
		const out: any = { filter: {} }
		if (!params) return out

		if (!key) {
			if (params.filter) {
				for (const [ fKey, fVal ] of Object.entries(params.filter)) {
					if (fKey.startsWith('$')) throw new Error('MongoDB operators are strictly prohibited in queries.')
					if (typeof fVal === 'object' && fVal !== null && !Array.isArray(fVal)) {
						for (const k of Object.keys(fVal)) {
							if (k.startsWith('$')) throw new Error('MongoDB operators are strictly prohibited in queries.')
						}
					}
					
					if (typeof fVal === 'string' && fVal.includes('*')) {
						out.filter[fKey] = new RegExp('^' + this.escapeRegExp(fVal).replace(/\\\*/g, '.*') + '$', 'i')
					} else if (Array.isArray(fVal)) {
						out.filter[fKey] = { $in: fVal }
					} else {
						out.filter[fKey] = fVal
					}
				}
			}
			if (params.sort) out.sort = params.sort
			if (params.pagination) {
				out.pagination = {
					page: params.pagination.page || 1,
					limit: params.pagination.limit || 10,
					total: 0,
					pages: 0
				}
			}
			return out
		}

		if (!params[key]) return out
		const options = params[key]

		if (options.filter) {
			for (const [ fKey, fVal ] of Object.entries(options.filter)) {
				if (fKey.startsWith('$')) throw new Error('MongoDB operators are strictly prohibited in queries.')
				if (typeof fVal === 'object' && fVal !== null && !Array.isArray(fVal)) {
					for (const k of Object.keys(fVal)) {
						if (k.startsWith('$')) throw new Error('MongoDB operators are strictly prohibited in queries.')
					}
				}
				
				if (typeof fVal === 'string' && fVal.includes('*')) {
					out.filter[fKey] = new RegExp('^' + this.escapeRegExp(fVal).replace(/\\\*/g, '.*') + '$', 'i')
				} else if (Array.isArray(fVal)) {
					out.filter[fKey] = { $in: fVal }
				} else {
					out.filter[fKey] = fVal
				}
			}
		}
		if (options.sort) out.sort = options.sort
		if (options.limit) out.limit = options.limit
		if (options.list) {
			out.list = {
				bridge: options.list.bridge,
				limit: options.list.limit
			}
		}
		return out
	}

	private isRecord(x: unknown): x is Record<string, unknown> {
		return typeof x === 'object' && x !== null && !Array.isArray(x)
	}

	private escapeRegExp(str: string): string {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	}
}
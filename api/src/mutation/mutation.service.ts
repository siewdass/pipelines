import { Injectable } from '@nestjs/common'
import { Db } from './mutation.type'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class MutationService {

	async uniques(collection: any, docs: any[], uniques: string[], session: any): Promise<void> {
		for (const field of uniques) {
			const values = docs.map(d => d[field]).filter(v => v !== undefined)
			if (values.length > 0) {
				const existingDocs = await collection.find({ [field]: { $in: values } }, { session }).toArray()
				if (existingDocs.length > 0) {
					throw new Error(`Unique constraint violation on field '${field}'. Conflicts: ${existingDocs.map(e => e[field]).join(', ')}`)
				}
			}
		}
	}

	timestamp(obj: any, audit: boolean, isCreate: boolean = true) {
		if (audit) {
			const now = new Date()
			if (isCreate) obj.createdAt = now
			obj.updatedAt = now
		}
	}

	getOptions(options: Record<string, unknown>): { uniques?: string[]; bridge?: Record<string, string>; audit?: boolean } {
		const out: { uniques?: string[]; bridge?: Record<string, string>; audit?: boolean } = {}
		if (!options || typeof options !== 'object') return out

		if ('uniques' in options) {
			const u = options['uniques']
			if (Array.isArray(u)) out.uniques = u.filter(x => typeof x === 'string')
		}

		// Bridge expected as object mapping childKey -> bridgeName, e.g. { comments: 'another' }
		if ('bridge' in options) {
			const b = options['bridge']
			if (b && typeof b === 'object') {
				const map: Record<string, string> = {}
				for (const [ key, val ] of Object.entries(b as Record<string, unknown>)) {
					if (typeof val === 'string' && val.length) map[key] = val
				}
				if (Object.keys(map).length) out.bridge = map
			}
		}

		if ('audit' in options) {
			out.audit = !!options['audit']
		}

		return out
	}

	async download(db: Db, doc: any, name: string, parentId: string, settings: any, session?: any, mode: 'delete' | 'upsert' = 'upsert'): Promise<void> {
		for (const [ key, value ] of Object.entries(doc)) {
			if (Array.isArray(value)) {
				if (false/* bridge */) {
					// Many-to-many
					await this.manyToMany(db, name, key, parentId, value as any[], session, mode)
					// remove pivot array from parent params so it isn't persisted
					delete doc[key]
				} else {
					// One-to-many
					await this.oneToMany(db, name, key, parentId, value as any[], [], false, settings, session, mode)
					// remove nested array from parent params so children are not embedded
					delete doc[key]
				}
			} else if (value && typeof value === 'object' && !Array.isArray(value) && (value.constructor === Object)) {
				// One-to-one — upsert the child first so it gets an id, then process its nested relations
				await this.oneToOne(db, value, key, name, parentId, false, mode, session)
				// After upsert, compute the child's id and recurse into its nested fields
				const childId = (value as any).id || (value as any)._id || ''
				if (childId) {
					await this.download(db, value, key, childId, settings, session, mode)
				}
				// remove nested object from parent params so it won't be embedded
				delete doc[key]
			}
		}
	}

	async manyToMany(db: Db, name: string, key: string, parentId: string, values: any[], session: any, mode: 'delete' | 'upsert') {
		const pivotCollection = `${name}_${key}`
		if (mode === 'delete') {
			await db.collection(pivotCollection).deleteMany({ [name]: parentId }, { session })
		} else if (mode === 'upsert') {
			// upsert: sincroniza los ids en la tabla pivote usando bulkWrite
			const currentIds = (await db.collection(pivotCollection)
				.find({ [name]: parentId }, { session })
				.project({ [key]: 1, _id: 0 })
				.toArray())
				.map(doc => doc[key])
			const currentIdsSet = new Set(currentIds)
			const valuesSet = new Set(values)
			const bulkOps: any[] = [
				...currentIds.filter(id => !valuesSet.has(id)).map(id => ({ deleteOne: { filter: { [name]: parentId, [key]: id } } })),
				...values.filter(id => !currentIdsSet.has(id)).map(id => ({ insertOne: { document: { [name]: parentId, [key]: id } } }))
			]
			if (bulkOps.length > 0) {
				await db.collection(pivotCollection).bulkWrite(bulkOps, { session })
			}
		}
	}

	async oneToMany(db: Db, name: string, key: string, parentId: string, value: any[], bridge: string[], audit: boolean, settingsOrMap?: any, session?: any, mode: 'delete' | 'upsert' = 'upsert') {
		const childCollectionName = key
		if (mode === 'upsert') {
			const childCol = db.collection(childCollectionName)
			const sentIds = value.filter((item: any) => item && item?.id).map((item: any) => item?.id)
			const existingIds = (await childCol.find({ [name]: parentId }, { session }).toArray()).map(doc => doc._id)
			const toDeleteIds = existingIds.filter(id => !sentIds.includes(id))
			// Prepare delete ops to include in the same bulkWrite as updates/inserts
			const deleteOps: any[] = toDeleteIds.length ? [ { deleteMany: { filter: { _id: { $in: toDeleteIds } } } } ] : []

			// Build and execute bulk operations
			const opsFromItems: any[] = value.map(item => {
				if (!item || typeof item !== 'object') return null
				const params = { ...item, [name]: parentId }

				// Build the document that will be written to the DB, but strip nested objects/arrays
				const writeDoc: any = { ...params }
				for (const k of Object.keys(writeDoc)) {
					const v = writeDoc[k]
					if (Array.isArray(v)) {
						delete writeDoc[k]
					} else if (v && typeof v === 'object' && v.constructor === Object) {
						delete writeDoc[k]
					}
				}

				if (audit) {
					if (!params.id) writeDoc.createdAt = new Date()
					if (params.id) writeDoc.updatedAt = new Date()
				}

				if (params.id) {
					const { id: _id, ...childParams } = writeDoc
					return { updateOne: { filter: { _id: params.id }, update: { $set: childParams } } }
				} else {
					writeDoc._id = uuidv4()
					// set the generated id back onto the original item so later nested calls see it
					item.id = writeDoc._id
					return { insertOne: { document: writeDoc } }
				}
			}).filter(Boolean)

			const bulkOps: any[] = [ ...deleteOps, ...opsFromItems ]
			if (bulkOps.length > 0) await childCol.bulkWrite(bulkOps, { session })

			const idsToProcess = value
				.map((it: any) => it && (it.id || it._id))
				.filter(Boolean)
				.map(id => (typeof id === 'object' ? String(id) : id))
			if (idsToProcess.length) {
				// Process nested relations using the original items (so nested fields are available)
				// saved children already exist in DB; use original `value` entries to recurse into nested fields
				for (const item of value) {
					if (!item || typeof item !== 'object') continue
					const childId = item.id || item._id || ''
					if (!childId) continue
					const childIdStr = typeof childId === 'object' ? String(childId) : childId
					await this.download(db, item, childCollectionName, childIdStr, settingsOrMap, session, 'upsert')
				}
			} else {
				// fallback: process items in-memory (should be rare)
				for (const item of value) {
					if (item && typeof item === 'object') {
						const childId = item.id || item._id || ''
						await this.download(db, item, childCollectionName, childId, settingsOrMap, session, 'upsert')
					}
				}
			}
		} else if (mode === 'delete') {
			for (const item of value) {
				// process nested relations first (cascade delete) so child sub-relations are removed
				if (item && typeof item === 'object' && item.id) {
					await this.download(db, item, key, item.id, settingsOrMap, session, 'delete')
				}
				await this.oneToOne(db, item, key, name, parentId, audit, 'delete', session)
			}
		}
	}

	private async oneToOne(db: Db, item: any, source: string, name: string, parentId: string, audit: boolean, mode: 'upsert' | 'delete', session?: any): Promise<void> {
		const collection = db.collection(source)
		if (mode === 'upsert') {
			if (item?.id) {
				const { id: _id, ...childParams } = item
				childParams[name] = parentId
				if (audit) childParams.updatedAt = new Date()
				await collection.updateOne({ _id }, { $set: childParams }, { session })
				item.id = _id
			} else {
				const childParams = { ...item, _id: uuidv4(), [name]: parentId } as any
				if (audit) childParams.createdAt = new Date()
				await collection.insertOne(childParams, { session })
				item.id = childParams._id
			}
		} else if (mode === 'delete') {
			const _id = item?._id
			if (_id) await collection.deleteOne({ _id }, { session })
		}
	}
}
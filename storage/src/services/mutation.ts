import { v4 as uuidv4 } from 'uuid'
import type { Db } from '../types'

export function getOptions(options: Record<string, any>): Record<string, any> {
	const out: any = { ...options }
	if (options.uniques && Array.isArray(options.uniques)) {
		out.uniques = options.uniques.filter((x: any) => typeof x === 'string')
	}
	if (options.bridge && typeof options.bridge === 'object') {
		const map: Record<string, string> = {}
		for (const [ key, val ] of Object.entries(options.bridge)) {
			if (typeof val === 'string' && val.length) map[key] = val
		}
		out.bridge = map
	}
	if (options.audit !== undefined) {
		out.audit = !!options.audit
	}
	return out
}

export async function uniques(collection: any, docs: any[], uniquesFields: string[], session?: any) {
	for (const field of uniquesFields) {
		const values = docs.filter((d) => d && d[field] !== undefined).map((d) => d[field])
		if (values.length > 0) {
			const existing = await collection.find({ [field]: { $in: values } }, { session }).toArray()
			if (existing.length > 0) {
				throw new Error(`Unique constraint violation on '${field}': ${existing.map((e: any) => e[field]).join(', ')}`)
			}
		}
	}
}

export async function findExistingId(collection: any, doc: any, uniquesFields: string[], session?: any) {
	if (!uniquesFields?.length) return null
	const query: any = {}
	let hasQuery = false
	for (const field of uniquesFields) {
		if (doc[field] !== undefined) {
			query[field] = doc[field]
			hasQuery = true
		}
	}
	if (!hasQuery) return null
	const existing = await collection.findOne(query, { session })
	return existing ? String(existing._id) : null
}

export async function download(
	db: Db,
	doc: any,
	name: string,
	parentId: string,
	settings: any,
	session?: any,
	mode: 'delete' | 'upsert' = 'upsert',
) {
	for (const [ key, value ] of Object.entries(doc)) {
		if (Array.isArray(value)) {
			const target = settings?.bridge?.[key]
			if (target) {
				await manyToMany(db, name, target, parentId, value, session, mode)
				delete doc[key]
			} else {
				await oneToMany(db, name, key, parentId, value, !!settings.audit, settings, session, mode)
				delete doc[key]
			}
		} else if (value && typeof value === 'object' && value !== null && !Array.isArray(value) && value.constructor === Object) {
			const obj = value as Record<string, any>
			await oneToOne(db, obj, key, name, parentId, !!settings.audit, mode, session, settings)
			const childId = obj.id || obj._id || ''
			if (childId) {
				await download(db, obj, key, String(childId), settings, session, mode)
			}
			delete doc[key]
		}
	}
}

async function manyToMany(
	db: Db,
	name: string,
	target: string,
	parentId: string,
	values: any[],
	session?: any,
	mode: 'delete' | 'upsert' = 'upsert',
) {
	const pivotCollection = `${name}_${target}`
	if (mode === 'delete') {
		await db.collection(pivotCollection).deleteMany({ [name]: parentId }, { session })
	} else {
		const current = await db.collection(pivotCollection)
			.find({ [name]: parentId }, { session })
			.project({ [target]: 1, _id: 0 })
			.toArray()
		const currentIds = current.map((c: any) => c[target])
		const currentSet = new Set(currentIds)
		const valuesSet = new Set(values)
		const bulkOps: any[] = [
			...currentIds.filter((id) => !valuesSet.has(id)).map((id) => ({
				deleteOne: { filter: { [name]: parentId, [target]: id } },
			})),
			...values.filter((id) => !currentSet.has(id)).map((id) => ({
				insertOne: { document: { _id: uuidv4(), [name]: parentId, [target]: id } },
			})),
		]
		if (bulkOps.length > 0) {
			await db.collection(pivotCollection).bulkWrite(bulkOps as any, { session })
		}
	}
}

async function oneToMany(
	db: Db,
	name: string,
	key: string,
	parentId: string,
	value: any[],
	audit: boolean,
	settingsOrMap?: any,
	session?: any,
	mode: 'delete' | 'upsert' = 'upsert',
) {
	const childCol = db.collection(key)
	if (mode === 'upsert') {
		const sentIds = value.filter((item) => item?.id).map((item) => item.id)
		const existing = await childCol.find({ [name]: parentId }, { session }).toArray()
		const existingIds = existing.map((d: any) => d._id)
		const toDeleteIds = existingIds.filter((id: any) => !sentIds.includes(id))
		const deleteOps = toDeleteIds.length
			? [ { deleteMany: { filter: { _id: { $in: toDeleteIds } } } } ]
			: []

		const opsFromItems = value.map((item) => {
			if (!item || typeof item !== 'object') return null
			const writeDoc: any = { ...item, [name]: parentId }
			for (const k of Object.keys(writeDoc)) {
				const v = writeDoc[k]
				if (Array.isArray(v) || (v && typeof v === 'object' && v.constructor === Object)) {
					delete writeDoc[k]
				}
			}
			if (audit) {
				if (item.id) writeDoc.updatedAt = new Date()
				else writeDoc.createdAt = new Date()
			}
			if (item.id) {
				const { id: _id, ...rest } = writeDoc
				return { updateOne: { filter: { _id: item.id }, update: { $set: rest } } }
			}
			writeDoc._id = uuidv4()
			item.id = writeDoc._id
			return { insertOne: { document: writeDoc } }
		}).filter(Boolean)

		if (settingsOrMap?.[key]?.uniques) {
			const toCheck: any[] = []
			for (const item of value) {
				if (!item.id) {
					const eid = await findExistingId(childCol, item, settingsOrMap[key].uniques, session)
					if (eid) {
						item.id = eid
						const idx = value.indexOf(item)
						const op = opsFromItems[idx]
						if (op?.insertOne) {
							const { _id, ...rest } = op.insertOne.document
							opsFromItems[idx] = { updateOne: { filter: { _id: eid }, update: { $set: rest } } }
						}
					} else {
						toCheck.push(item)
					}
				}
			}
			if (toCheck.length) await uniques(childCol, toCheck, settingsOrMap[key].uniques, session)
		}

		const bulkOps = [ ...deleteOps, ...opsFromItems.filter(Boolean) ]
		if (bulkOps.length) await childCol.bulkWrite(bulkOps as any, { session })

		for (const item of value) {
			if (!item?.id) continue
			await download(db, item, key, String(item.id), settingsOrMap, session, 'upsert')
		}
	} else {
		for (const item of value) {
			if (item?.id) await download(db, item, key, item.id, settingsOrMap, session, 'delete')
			await oneToOne(db, item, key, name, parentId, audit, 'delete', session)
		}
	}
}

async function oneToOne(
	db: Db,
	item: any,
	source: string,
	name: string,
	parentId: string,
	audit: boolean,
	mode: 'upsert' | 'delete',
	session?: any,
	settings?: any,
) {
	const collection = db.collection(source)
	if (mode === 'upsert') {
		if (item?.id) {
			const { id: _id, ...rest } = item
			rest[name] = parentId
			if (audit) rest.updatedAt = new Date()
			await collection.updateOne({ _id }, { $set: rest }, { session })
			item.id = _id
		} else {
			if (settings?.[source]?.uniques) {
				const eid = await findExistingId(collection, item, settings[source].uniques, session)
				if (eid) {
					item.id = eid
					const { id: _id, ...rest } = item
					rest[name] = parentId
					if (audit) rest.updatedAt = new Date()
					await collection.updateOne({ _id }, { $set: rest }, { session })
					return
				}
				await uniques(collection, [ item ], settings[source].uniques, session)
			}
			const doc = { ...item, _id: uuidv4(), [name]: parentId }
			if (audit) doc.createdAt = new Date()
			await collection.insertOne(doc, { session })
			item.id = doc._id
		}
	} else {
		const _id = item?._id
		if (_id) await collection.deleteOne({ _id }, { session })
	}
}

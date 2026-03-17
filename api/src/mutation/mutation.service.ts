import { Injectable } from '@nestjs/common'
import { Db } from './mutation.type'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class MutationService {

	async uniques(collection: any, docs: any[], uniques: string[], session: any): Promise<void> {
		for (const field of uniques) {
			const values = docs
				.filter((d: any) => d && d[field] !== undefined)
				.map((d: any) => d[field])
				
			if (values.length > 0) {
				const query = { [ field ]: { $in: values } }
				const existingDocs = await collection.find(query, { session }).toArray()
				if (existingDocs.length > 0) {
					const conflicts = existingDocs.map((e: any) => e[field]).join(', ')
					throw new Error(`Unique constraint violation on field '${field}'. Conflicts: ${conflicts}`)
				}
			}
		}
	}

	async findExistingId(collection: any, doc: any, uniques: string[], session: any): Promise<string | null> {
		if (!uniques || !uniques.length) return null
		const query: any = {}
		let hasQuery = false
		for (const field of uniques) {
			if (doc[field] !== undefined) {
				query[field] = doc[field]
				hasQuery = true
			}
		}
		if (!hasQuery) return null

		const existing = await collection.findOne(query, { session })
		return existing ? String(existing._id) : null
	}

	timestamp(obj: any, audit: boolean, isCreate: boolean = true) {
		if (audit) {
			const now = new Date()
			if (isCreate) obj.createdAt = now
			obj.updatedAt = now
		}
	}

	getOptions(options: Record<string, any>): any {
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

	async download(db: Db, doc: any, name: string, parentId: string, settings: any, session?: any, mode: 'delete' | 'upsert' = 'upsert'): Promise<void> {
		// Aseguramos que la colección principal se registre
		if (mode === 'upsert') {
			await this.registerCollection(db, name, doc, session)
		}

		for (const [ key, value ] of Object.entries(doc)) {
			if (Array.isArray(value)) {
				const target = settings?.bridge?.[key]
				if (target) {
					// Many-to-many
					if (mode === 'upsert') {
						await this.registerAssociation(db, name, key, {
							name: key,
							collection: target,
							type: 'many-to-many',
							bridge: target
						}, session)
					}
					await this.manyToMany(db, name, target, parentId, value as any[], session, mode)
					delete doc[key]
				} else {
					// One-to-many
					if (mode === 'upsert') {
						await this.registerAssociation(db, name, key, {
							name: key,
							collection: key,
							type: 'one-to-many'
						}, session)
					}
					await this.oneToMany(db, name, key, parentId, value as any[], [], !!settings.audit, settings, session, mode)
					delete doc[key]
				}
			} else if (value && typeof value === 'object' && value !== null && !Array.isArray(value) && (value.constructor === Object)) {
				// One-to-one
				if (mode === 'upsert') {
					await this.registerAssociation(db, name, key, {
						name: key,
						collection: key,
						type: 'one-to-one'
					}, session)
				}
				await this.oneToOne(db, value, key, name, parentId, !!settings.audit, mode, session, settings)
				const childId = (value as any).id || (value as any)._id || ''
				if (childId) {
					await this.download(db, value, key, childId, settings, session, mode)
				}
				delete doc[key]
			}
		}
	}

	private async registerCollection(db: Db, name: string, doc?: any, session?: any) {
		const schemas = db.collection('schemas')
		const setDoc: any = { name }

		if (doc && typeof doc === 'object') {
			for (const [ k, v ] of Object.entries(doc)) {
				// Prevent overwriting internal/system fields
				if (k === 'id' || k === '_id' || k === 'createdAt' || k === 'updatedAt') continue
				
				let type: string = typeof v
				if (Array.isArray(v)) {
					type = 'array'
				} else if (v === null) {
					type = 'null'
				} else if (typeof v === 'object' && v.constructor === Object) {
					type = 'object'
				}
				
				setDoc[`fields.${k}`] = type
			}
		}

		await schemas.updateOne(
			{ _id: name as any },
			{ $set: setDoc },
			{ upsert: true, session }
		)
	}

	private async registerAssociation(db: Db, source: string, key: string, details: any, session?: any) {
		const schemas = db.collection('schemas')
		
		// 1. Registrar la asociación en la fuente
		await schemas.updateOne(
			{ _id: source as any },
			{ 
				$set: { 
					name: source,
					[`associations.${key}`]: details 
				} 
			},
			{ upsert: true, session }
		)

		// 2. Asegurar que la colección destino también exista en schemas
		if (details.collection) {
			await this.registerCollection(db, details.collection, null, session)
		}
	}

	async manyToMany(db: Db, name: string, target: string, parentId: string, values: any[], session: any, mode: 'delete' | 'upsert') {
		const pivotCollection = `${name}_${target}`
		if (mode === 'delete') {
			await db.collection(pivotCollection).deleteMany({ [name]: parentId }, { session })
		} else if (mode === 'upsert') {
			const currentIds = (await db.collection(pivotCollection)
				.find({ [name]: parentId }, { session })
				.project({ [target]: 1, _id: 0 })
				.toArray())
				.map(doc => doc[target])
			const currentIdsSet = new Set(currentIds)
			const valuesSet = new Set(values)
			const bulkOps: any[] = [
				...currentIds.filter(id => !valuesSet.has(id)).map(id => ({ deleteOne: { filter: { [name]: parentId, [target]: id } } })),
				...values.filter(id => !currentIdsSet.has(id)).map(id => ({ insertOne: { document: { _id: uuidv4(), [name]: parentId, [target]: id } } }))
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
			const deleteOps: any[] = toDeleteIds.length ? [ { deleteMany: { filter: { _id: { $in: toDeleteIds } } } } ] : []

			const opsFromItems: any[] = value.map(item => {
				if (!item || typeof item !== 'object') return null
				const params = { ...item, [name]: parentId }
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

				if (item.id) {
					const { id: _id, ...childParams } = writeDoc
					return { updateOne: { filter: { _id: item.id }, update: { $set: childParams } } }
				} else {
					writeDoc._id = uuidv4()
					item.id = writeDoc._id
					return { insertOne: { document: writeDoc } }
				}
			}).filter(Boolean)

			if (settingsOrMap?.[key]?.uniques) {
				const toCheck: any[] = []
				for (const item of value) {
					if (!item.id) {
						const existingId = await this.findExistingId(childCol, item, settingsOrMap[key].uniques, session)
						if (existingId) {
							item.id = existingId
							// Update the corresponding op in opsFromItems
							const opIndex = value.indexOf(item)
							if (opIndex !== -1 && opsFromItems[opIndex]?.insertOne) {
								const { document } = opsFromItems[opIndex].insertOne
								const { ...updatePayload } = document
								delete (updatePayload as any)._id
								opsFromItems[opIndex] = { updateOne: { filter: { _id: existingId }, update: { $set: updatePayload } } }
							}
						} else {
							toCheck.push(item)
						}
					}
				}
				if (toCheck.length > 0) {
					await this.uniques(childCol, toCheck, settingsOrMap[key].uniques, session)
				}
			}

			const bulkOps: any[] = [ ...deleteOps, ...opsFromItems ]
			if (bulkOps.length > 0) await childCol.bulkWrite(bulkOps, { session })

			for (const item of value) {
				if (!item || typeof item !== 'object') continue
				const childId = item.id || item._id || ''
				if (!childId) continue
				await this.download(db, item, childCollectionName, String(childId), settingsOrMap, session, 'upsert')
			}
		} else if (mode === 'delete') {
			for (const item of value) {
				if (item && typeof item === 'object' && item.id) {
					await this.download(db, item, key, item.id, settingsOrMap, session, 'delete')
				}
				await this.oneToOne(db, item, key, name, parentId, audit, 'delete', session)
			}
		}
	}

	private async oneToOne(db: Db, item: any, source: string, name: string, parentId: string, audit: boolean, mode: 'upsert' | 'delete', session?: any, settings?: any): Promise<void> {
		const collection = db.collection(source)
		if (mode === 'upsert') {
			if (item?.id) {
				const { id: _id, ...childParams } = item
				childParams[name] = parentId
				if (audit) childParams.updatedAt = new Date()
				await collection.updateOne({ _id }, { $set: childParams }, { session })
				item.id = _id
			} else {
				// Auto-resolve ID by unique fields if missing
				if (settings?.[source]?.uniques) {
					const existingId = await this.findExistingId(collection, item, settings[source].uniques, session)
					if (existingId) {
						item.id = existingId
						const { id: _id, ...childParams } = item
						childParams[name] = parentId
						if (audit) childParams.updatedAt = new Date()
						await collection.updateOne({ _id }, { $set: childParams }, { session })
						return
					}
					// Still check global uniques for other docs or if not found
					await this.uniques(collection, [ item ], settings[source].uniques, session)
				}
				const childParams = { ...item, _id: uuidv4(), [ name ]: parentId } as any
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
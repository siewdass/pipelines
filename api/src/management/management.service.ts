import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class ManagementService {
	constructor(
    private readonly dbService: DatabaseService
	) {}

	// Accept plain HTTP JSON bodies (no gRPC JsonValue decoding)
	prepare(data: any): { collection: string; doc?: any; association?: any } {
		return {
			collection: data.collection,
			doc: data.doc ?? undefined,
			association: data.association ?? undefined
		}
	}

	async fetch(dbName: string, collection: string, query: any = {}, association?: any, doc?: any): Promise<any> {
		const dbContext = this.dbService.getDbContext(dbName)
		let associations = {}
		let colName = collection
		let filter = query
		const schemasCol = dbContext.db.collection('schemas')

		if (association) {
			const assocName = association.name
			let schemaDoc = await schemasCol.findOne({ name: collection })
			associations = schemaDoc && schemaDoc.associations ? schemaDoc.associations : {}
			if (associations[assocName]) {
				const assoc = associations[assocName]
				const type = assoc.type
				const relatedCollection = assoc.collection
				if (doc) {
					if (type === 'one-to-many') {
						filter = { [collection]: doc._id }
					} else if (type === 'one-to-one') {
						filter = { _id: doc[assocName] }
					}
				}
				colName = relatedCollection
				schemaDoc = await schemasCol.findOne({ name: relatedCollection })
				associations = schemaDoc && schemaDoc.associations ? schemaDoc.associations : {}
			}
		} else {
			const schemaDoc = await schemasCol.findOne({ name: collection })
			associations = schemaDoc && schemaDoc.associations ? schemaDoc.associations : {}
		}

		const col = dbContext.db.collection(colName)
		const docs = await col.find(filter).toArray()
		for (const d of docs) {
			await this.expandDoc(dbContext.db, d, associations)
		}
		return {
			collection: colName,
			docs,
			schema: associations
		}
	}

	async expandDoc(db: any, doc: any, associations: any): Promise<void> {
		for (const key of Object.keys(associations)) {
			const assoc = associations[key]
			const type = assoc.type
			const collection = assoc.collection
			if (type === 'one-to-one') {
				if (typeof doc[key] === 'string') {
					const related = await db.collection(collection).findOne({ _id: doc[key] })
					if (related) doc[key] = related
				}
			} else if (type === 'one-to-many') {
				const parentId = doc._id
				const related = await db.collection(collection).find({ [key]: parentId }).toArray()
				doc[key] = related
			}
			// many-to-many no implementado
		}
	}
}

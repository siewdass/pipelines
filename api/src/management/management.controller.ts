import { Controller, Get, Post, Body, Headers } from '@nestjs/common'
import { ManagementService } from './management.service'
import { ProjectService } from '../project/project.service'

@Controller('management')
export class ManagementController {
	constructor(
    private readonly managementService: ManagementService,
    private readonly projectService: ProjectService
	) {}

  @Get('collections')
	async collections(@Headers('project-id') projectId: string): Promise<any> {
		const dbContext = this.projectService.getProjectContext(projectId)
		const col = dbContext.db.collection('schemas')
		const schemas = await col.find({}, { projection: { _id: 0 } }).toArray()
		return { collections: schemas }
	}

  // pull
  @Post('fetch')
  async fetch(@Body() data: any, @Headers('project-id') projectId: string): Promise<any> {
  	const dbContext = this.projectService.getProjectContext(projectId)
  	const { collection, doc, association } = this.managementService.prepare(data)
  	let associations = {}
  	let colName = collection
  	let filter = {}
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
  		await this.managementService.expandDoc(dbContext.db, d, associations)
  	}
  	return {
  		collection: colName,
  		docs,
  		schema: associations
  	}
  }
}

import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common'
import { Request } from 'express'
import { DatabaseService } from './database.service'
import { ProjectService } from '../project/project.service'
import { UserAuthGuard } from '../authorization/user.guard'
import { ProjectGuard } from '../project/project.guard'

@Controller('database')
@UseGuards(UserAuthGuard, ProjectGuard)
export class DatabaseController {
	constructor(
    private readonly databaseService: DatabaseService,
    private readonly projectService: ProjectService
	) {}

  @Get('tables')
	async collections(@Req() req: Request & { projectId: string }): Promise<any> {
		const projectId = req.projectId
		const dbContext = await this.projectService.getProjectContext(projectId)
		const col = dbContext.db.collection('schemas')
		const schemas = await col.find({}, { projection: { _id: 0 } }).toArray()
		return { collections: schemas }
	}

  // pull
  @Post('fetch')
  async fetch(@Body() data: any, @Req() req: Request & { projectId: string }): Promise<any> {
  	const projectId = req.projectId
  	const dbContext = await this.projectService.getProjectContext(projectId)
  	const { collection, doc, association } = this.databaseService.prepare(data)
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
  		await this.databaseService.expandDoc(dbContext.db, d, associations)
  	}
  	return {
  		collection: colName,
  		docs,
  		schema: associations
  	}
  }
}

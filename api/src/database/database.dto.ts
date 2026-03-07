import { IsOptional, IsString } from 'class-validator'

export class CreateDatabaseDto {
	@IsString()
	dbName!: string

	@IsOptional()
	@IsString()
	projectId?: string

	@IsOptional()
	@IsString()
	token?: string

	@IsOptional()
	@IsString()
	origin?: string
}

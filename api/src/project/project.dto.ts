import { IsOptional, IsString } from 'class-validator'

export class CreateProjectDto {
	@IsString()
	projectId!: string

	@IsOptional()
	@IsString()
	token?: string

	@IsOptional()
	@IsString()
	origin?: string
}

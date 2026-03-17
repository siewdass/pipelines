import { IsOptional, IsString, IsEmail, IsUrl, IsIn } from 'class-validator'

export class CreateProjectDto {
	@IsString()
	name!: string

	@IsOptional()
	@IsString()
	description?: string
}

export class UpdateProjectStatusDto {
	@IsString()
	@IsIn([ 'active', 'inactive' ])
	status: string
}

export class AddOriginDto {
	@IsUrl()
	url: string
}

export class SaveEmailSettingsDto {
	@IsOptional()
	@IsEmail()
	email?: string

	@IsOptional()
	@IsString()
	token?: string
}

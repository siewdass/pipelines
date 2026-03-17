import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator'

export class CreateAccountDto {
	@IsEmail()
	email!: string

	@IsString()
	@MinLength(6)
	password!: string

	@IsOptional()
	@IsString()
	name?: string
}

export class UpdateAccountDto {
	@IsOptional()
	@IsEmail()
	email?: string

	@IsOptional()
	@IsString()
	@MinLength(6)
	password?: string

	@IsOptional()
	@IsString()
	name?: string
}

export class AccountResponseDto {
	id!: string
	email!: string
	name?: string
}

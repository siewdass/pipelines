import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator'

export class RegisterRequestDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsOptional()
  @IsString()
  name?: string
}

export class RegisterResponseDto {
	success: boolean
	message: string
	user?: { id?: string; email?: string; name?: string }
}

export class LoginRequestDto {
  @IsEmail()
  email: string

  @IsString()
  password: string
}

export class LoginResponseDto {
	success: boolean
	message: string
	token?: string
	user?: { id?: string; email?: string; name?: string } | null
}

export class RecoverRequestDto {
  @IsEmail()
  email: string
}
export class RecoverResponseDto {
	success: boolean
	message: string
}

export class ResetRequestDto {
  @IsString()
  token: string

  @IsString()
  @MinLength(6)
  newPassword: string
}

export class ResetResponseDto {
	success: boolean
	message: string
}

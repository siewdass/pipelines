import { IsString, IsOptional, IsObject, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class MutationRequestDto {
  @IsString()
  @Matches(/^(?!\s*(?:users|roles|permissions)\s*$).+/i, { message: 'source cannot be users, roles or permissions' })
  @ApiProperty({ description: 'Source collection name to retrieve from (root collection).' })
  source: string

  @IsObject()
  @ApiProperty({ description: 'Input projection per collection (fields, embedded).' })
  input: Record<string, unknown>

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Options per collection: uniques, bridge, timestamp' })
  options?: Record<string, unknown>
}

export class MutationResponseDto {
  @ApiProperty({ description: 'Indicates if the mutation was successful.' })
	success: boolean

  @ApiProperty({ description: 'Response message or error details.' })
  message: string
}

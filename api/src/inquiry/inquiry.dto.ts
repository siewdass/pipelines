import { IsString, IsOptional, IsObject } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class InquiryRequestDto {
  @IsString()
  @ApiProperty({ description: 'Source collection name to retrieve from (root collection).' })
  source: string

  @IsObject()
  @ApiProperty({ description: 'Output projection per collection (fields, embedded).' })
  output: Record<string, unknown>

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Options per collection: sort, filter, pagination' })
  options?: Record<string, unknown>
}

export class InquiryResponseDto {
	item?: { id?: string; [key: string]: unknown }

  @ApiProperty({ description: 'Either an array of documents (for single-source retrieve) or a map of collection name to an array of documents.' })
  items?: { id?: string; [key: string]: unknown }[] | Record<string, { id?: string; [key: string]: unknown }[]>

  @ApiProperty({ description: 'Optional pagination information for root-level retrievals (page/limit/total/pages).', required: false })
  pagination?: { page: number; limit: number; total: number; pages: number }
}

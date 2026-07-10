// import { Controller, Post, Body, UseGuards, Req, Logger } from '@nestjs/common'
// import { Request } from 'express'
// import { InquiryRequestDto, InquiryResponseDto } from './inquiry.dto'
// import { ProjectService } from '../project/project.service'
// import { InquiryService } from './inquiry.service'
// import { ApiBody, ApiOkResponse } from '@nestjs/swagger'
// import { RetrieveRequestDoc, RetrieveResponseDoc } from './inquiry.doc'
// import { UserAuthGuard } from '../authorization/user.guard'
// import { ProjectGuard } from '../project/project.guard'
// import { SourceGuard } from '../authorization/source.guard'

// @Controller('inquiry')
// @UseGuards(ProjectGuard, UserAuthGuard, SourceGuard)
// export class InquiryController {
// 	private readonly logger = new Logger(InquiryController.name)
// 	constructor(
// 		private readonly projectService: ProjectService,
// 		private readonly inquiryService: InquiryService
// 	) {}

// 	@ApiBody(RetrieveRequestDoc)
// 	@ApiOkResponse(RetrieveResponseDoc)
// 	@Post('index')
// 	async index(@Body() { source }: InquiryRequestDto, @Req() req: Request & { projectId: string }): Promise<InquiryResponseDto> {
// 		...
// 	}

// 	@ApiBody(RetrieveRequestDoc)
// 	@ApiOkResponse(RetrieveResponseDoc)
// 	@Post('retrieve')
// 	async retrieve(
// 		@Body() { source, filter, options }: InquiryRequestDto,
// 		@Req() req: Request & { projectId: string }
// 	): Promise<InquiryResponseDto> {
// 		...
// 	}
// }

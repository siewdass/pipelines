import { Injectable } from '@nestjs/common'
import { ProjectService } from '../project/project.service'

@Injectable()
export class UserService {
	constructor(
    private readonly projectService: ProjectService
) {}

}

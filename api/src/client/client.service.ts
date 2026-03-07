import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class ClientService {
	constructor(
    private readonly dbService: DatabaseService
	) {}

}

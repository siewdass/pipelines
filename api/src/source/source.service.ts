import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Source } from './source.schema'

@Injectable()
export class SourceService {
	private readonly logger = new Logger(SourceService.name)

	constructor(
		@InjectModel(Source.name, 'default') private sourceModel: Model<Source>
	) {}

	async list(projectId: string) {
		return this.sourceModel.find({ projectId }).sort({ createdAt: -1 }).limit(10)
	}

	async getById(projectId: string, sourceId: string) {
		const source = await this.sourceModel.findOne({ _id: sourceId, projectId })
		if (!source) throw new NotFoundException('Source not found')
		return source
	}

	async getLatest(projectId: string) {
		return this.sourceModel.findOne({ projectId }).sort({ createdAt: -1 })
	}

	async create(data: { projectId: string; basedOn?: string; code: string; features: any[] }) {
		const source = new this.sourceModel({
			projectId: data.projectId,
			basedOn: data.basedOn || null,
			code: data.code,
			features: data.features || [],
		})
		return source.save()
	}

	async delete(projectId: string, sourceId: string) {
		const result = await this.sourceModel.deleteOne({ _id: sourceId, projectId })
		if (result.deletedCount === 0) throw new NotFoundException('Source not found')
		return { deleted: true }
	}
}

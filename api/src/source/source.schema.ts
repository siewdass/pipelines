import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

@Schema({ collection: 'sources', timestamps: true })
export class Source extends Document {
	@Prop({ type: String, default: () => uuidv4() })
	declare _id: string

	@Prop({ required: true, index: true })
	projectId: string

	@Prop({ type: String, default: null })
	basedOn: string | null

	@Prop({ required: true })
	code: string

	@Prop({ type: [{ name: String, features: [{ name: String, description: String }] }], default: [] })
	features: { name: string; features: { name: string; description: string }[] }[]
}

export const SourceSchema = SchemaFactory.createForClass(Source)

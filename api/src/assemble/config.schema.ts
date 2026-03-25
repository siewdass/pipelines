import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

@Schema({ collection: 'configs' })
export class AssembleConfig extends Document {
	@Prop({ type: String, default: () => uuidv4() })
	declare _id: string

	@Prop({ required: true, unique: true })
	projectId: string

	@Prop()
	source: string

	@Prop()
	build: string

	@Prop()
	icon: string

	@Prop()
	font: string
}

export const AssembleConfigSchema = SchemaFactory.createForClass(AssembleConfig)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

@Schema({ collection: 'prompts', timestamps: true })
export class AssemblePrompt extends Document {
	@Prop({ type: String, default: () => uuidv4() })
	declare _id: string

	@Prop({ required: true, index: true })
	projectId: string

	@Prop({ required: true, enum: [ 'user', 'model' ] })
	role: string

	@Prop({ required: true })
	content: string
}

export const AssemblePromptSchema = SchemaFactory.createForClass(AssemblePrompt)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

@Schema({ collection: 'projects' })
export class Project extends Document {
  @Prop({ type: String, default: () => uuidv4() })
	declare _id: string

  @Prop({ required: true, unique: true })
  token: string

  @Prop({ required: true })
  projectId: string

  @Prop({ required: true })
  accountId: string

  @Prop()
  origin: string
}

export const ProjectSchema = SchemaFactory.createForClass(Project)

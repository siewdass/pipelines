import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

@Schema({ collection: 'origins' })
export class Origin extends Document {
  @Prop({ type: String, default: () => uuidv4() })
	declare _id: string

  @Prop({ required: true })
  url: string

  @Prop({ required: true })
  projectId: string

  @Prop({ default: 'active' })
  status: string
}

export const OriginSchema = SchemaFactory.createForClass(Origin)

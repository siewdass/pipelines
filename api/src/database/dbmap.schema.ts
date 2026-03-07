import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

@Schema({ collection: 'dbmap' })
export class DbMap extends Document {
  @Prop({ type: String, default: () => uuidv4() })
	declare _id: string

  @Prop({ required: true, unique: true })
  token: string

  @Prop({ required: true })
  dbName: string
  // deberia ser el id del proyecto ya que eso no cambia

  @Prop()
  projectId: string

  @Prop()
  origin: string
}

export const DbMapSchema = SchemaFactory.createForClass(DbMap)

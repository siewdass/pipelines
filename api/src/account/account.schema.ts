import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

@Schema({ collection: 'account' })
export class Account extends Document {
  @Prop({ type: String, default: () => uuidv4() })
	declare _id: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop()
  name?: string
}

export const AccountSchema = SchemaFactory.createForClass(Account)

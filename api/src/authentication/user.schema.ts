import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

@Schema({ collection: 'users' })
export class User extends Document {
  @Prop({ type: String, default: () => uuidv4() })
	declare _id: string

  @Prop({ required: true, unique: true })
  email: string

  // Password is optional for users created via admin/tenant endpoints
  @Prop()
  password?: string

  @Prop()
  name?: string

  @Prop({ default: false })
  firstLogin?: boolean

  @Prop({ default: Date.now })
  createdAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User)

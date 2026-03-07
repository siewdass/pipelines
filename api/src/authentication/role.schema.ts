import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

@Schema({ collection: 'roles' })
export class Role extends Document {
  @Prop({ type: String, default: () => uuidv4() })
	declare _id: string

  @Prop({ required: true, unique: true })
  name: string

  @Prop({ type: [ String ], default: [] })
  permissions: string[]

  @Prop()
  description?: string
}

export const RoleSchema = SchemaFactory.createForClass(Role)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

@Schema({ collection: 'users' })
export class User extends Document {
  @Prop({ type: String, default: () => uuidv4() })
	declare _id: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop()
  password?: string

  @Prop()
  name?: string

  @Prop({ default: false })
  firstLogin?: boolean

  @Prop({ type: [ String ], default: [] })
  roles: string[]

  @Prop({ default: Date.now })
  createdAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User)

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

@Schema({ collection: 'permissions' })
export class Permission extends Document {
  @Prop({ type: String, default: () => uuidv4() })
	declare _id: string

  @Prop({ required: true, unique: true })
  name: string // a friendly name for the permission, e.g. 'posts:read'

  // Explicit boolean flags for common actions. Defaults to false.
  @Prop({ type: Boolean, default: false })
  read: boolean

  @Prop({ type: Boolean, default: false })
  write: boolean

  @Prop({ type: [ String ], default: [] })
  resources: string[] // e.g. ['posts','comments']

  @Prop()
  description?: string
}

export const PermissionSchema = SchemaFactory.createForClass(Permission)

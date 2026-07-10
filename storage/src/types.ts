import type { mongo } from 'mongoose'

export type Db = mongo.Db
export type Doc = Record<string, any>

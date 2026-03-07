import * as mongoose from 'mongoose'

export type Db = mongoose.mongo.Db;

export type Doc = { [key: string]: any };

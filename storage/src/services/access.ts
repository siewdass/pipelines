import type { Db } from '../types'

export type SourceAccess = 'public' | 'private'

export async function getSourceAccess(db: Db, source: string): Promise<SourceAccess> {
	const doc = await db.collection('schemas').findOne({ _id: source as any })
	return doc?.access === 'private' ? 'private' : 'public'
}

export async function ensureSourceRegistered(db: Db, source: string): Promise<void> {
	const exists = await db.collection('schemas').findOne({ _id: source as any })
	if (!exists) {
		await db.collection('schemas').insertOne({ _id: source as any, name: source, access: 'public' })
	}
}

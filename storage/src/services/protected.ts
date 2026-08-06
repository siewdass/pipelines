export const PROTECTED_SOURCES = [ 'user', 'role', 'permission', 'asset', 'schema' ]

export function isProtectedSource(source: string): boolean {
	const s = (source || '').toLowerCase()
	return PROTECTED_SOURCES.some((base) => s === base || s === `${base}s`)
}

export const DOCUMENT_TYPES = new Set([
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/vnd.ms-powerpoint',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	'text/plain',
	'text/csv',
	'application/csv',
])

export function getKind(mimetype: string): string {
	if (mimetype.startsWith('image/')) return 'image'
	if (mimetype.startsWith('video/')) return 'video'
	if (mimetype.startsWith('audio/')) return 'audio'
	if (mimetype.startsWith('text/') || DOCUMENT_TYPES.has(mimetype)) return 'document'
	return 'unknown'
}

export function isAllowed(mimetype: string): boolean {
	return getKind(mimetype) !== 'unknown'
}

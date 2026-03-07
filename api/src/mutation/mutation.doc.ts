export const UpsertRequestDoc = {
	description: 'Request body for a create (mutation) operation. Each collection maps to the document(s) to create; per-item `_` projection options are not required for creation payloads.',
	schema: {
		example: {
			source: 'posts',
			input: {
				title: 'My First Post',
				content: 'This is a test post to demonstrate associations.',
				author: 'user123',
				comments: [
					{ type: 'commenter1', text: 'Great post!' },
					{ type: 'commenter2', text: 'I agree with this.' },
					{
						type: 'commenter3',
						text: 'Thanks for sharing.',
						tags: { key: 'data' }
					},
				],
			},
			options: {
				uniques: [ 'title' ],
				comments: {}
			}
		}
	}
}

export const UpsertResponseDoc = {
	description: 'Response message with status of the upsert operation.',
	schema: {
		example: {
			success: true,
			message: 'Documents upserted successfully',
		}
	}
}

export const PurgedRequestDoc = {
	description: 'Request body for a purge operation. The first item in `input` is the primary document to remove (identified by `_id`). Subsequent items may list related documents or relation descriptors to process (cascade deletes or side-effects).',
	schema: {
		example: {
			source: 'posts',
			input: [
				{ id: 'UUID' }, 
				{ comments: [
					{ id: 'UUID' },
					{ id: 'UUID' }
				] },
			],
			options: { }
		}
	}
}

export const PurgeResponseDoc = {
	description: 'Response message with status of the purge operation.',
	schema: {
		example: {
			success: true,
			message: 'Documents purged successfully',
		}
	}
}
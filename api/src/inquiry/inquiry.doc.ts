export const RetrieveRequestDoc = {
	description: 'Specify the source. Dynamic query options. To include fields or 0 to exclude fields in output.',
	schema: {
		example: {
			source: 'posts',
			output: {
				id: 1,
				title: 1,
				content: 1,
				comments: {
					id: 1,
					text: 1,
				},
			},
			options: {
				pagination: { page: 1, limit: 5 },
				list: {
					sort: { createdAt: 'asc' },
				},
				filter: {
					content: { phrase: 'quick' },
					status: { equal: 'active' },
					createdAt: { range: { min: '2024-01-01', max: '2024-12-31' } },
					views: { range: { min: 100, max: 1000 } },
				},
				comments: {
					list: {
						sort: { createdAt: 'desc' },
						bridge: { comments: 'another' }, //pivot
					},
					filter: {
						type: { contains: [ 'commenter1', 'commenter2' ] },
					},
				},
			}
		}
	}
}

export const RetrieveResponseDoc = {
	description: 'Retrieved documents with populated fields as per projection.',
	schema: {
		example: {
			items: [ {
				id: 'UUID',
				title: 'Hello',
				content: 'This is a post.',
				comments: [
					{
						id: 'UUID',
						type: 'commenter1',
						text: 'ok'
					}
				]
			} ],
			pagination: {
				page: 1,
				limit: 5,
				total: 100,
				pages: 20
			}
		}
	}
}
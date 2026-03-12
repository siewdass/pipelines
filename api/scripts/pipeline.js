const headers = {
    'Content-Type': 'application/json',
    'db-token': 'token_db1',
    'db-name': 'db1'
};

const url = 'http://localhost:8000';

async function post(path, body) {
    const res = await fetch(`${url}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    try { return await res.json() }
    catch (e) { return { error: 404 }; }
}

// Main run: create -> get single created post (index) -> update -> retrieve all (no pagination)
(async function run() {
    const title = `Pipeline Post ${Date.now()}`;

    // 1) Create
    const created = await post('/mutation/upsert', {
        source: 'posts',
        input: {
            title,
            content: 'Contenido de prueba desde pipeline.js',
            author: 'pipeline-user',
            comments: [
                { type: 'commenter1', text: 'Primero' },
                { type: 'commenter2', text: 'Segundo', testing: { nested: 'ok' } },
            ],
        },
        options: {},
    });
    console.log('Create response:', created);
    if (created && created.error) { console.error('Create failed:', created); return }

    // 2) Retrieve only the created post using /inquiry/index (single item)
    const indexRes = await post('/inquiry/index', {
        source: 'posts',
        output: { id: 1, title: 1, content: 1, author: 1, createdAt: 1 },
        options: { filter: { author: 'pipeline-user', title } },
    });
    console.log('Index response (single):', indexRes);
    if (indexRes && indexRes.error) { console.error('Index failed:', indexRes); return }

    const item = indexRes?.item ?? (Array.isArray(indexRes?.items) ? indexRes.items[0] : undefined);
    if (!item) { console.warn('No se encontró el post creado con index'); return }
    const id = item.id || item._id;
    console.log('Found id:', id);

    // 3) Update the found post by id
    const updated = await post('/mutation/upsert', {
        source: 'posts',
        input: { id, title: item.title, content: (item.content || '') + ' (actualizado)', author: item.author },
        options: {},
    });
    console.log('Update response:', updated);
    if (updated && updated.error) { console.error('Update failed:', updated); return }

    // 4) Retrieve all posts by the author (no pagination)
    const all = await post('/inquiry/retrieve', {
        source: 'posts',
        output: { id: 1, title: 1, content: 1, author: 1, createdAt: 1 },
        options: { filter: { author: 'pipeline-user' }, list: { sort: { createdAt: 'desc' } } },
    });
    console.log('All posts by author (after update):', all);
})();
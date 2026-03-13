const headers = {
    'Content-Type': 'application/json',
    'db-token': 'token_db1',
};

const url = 'http://localhost:8000';

const payload = {
    source: 'posts',
    input: {
        title: `My First Postx ${Date.now()}`,
        content: 'This is a test post to demonstrate associations.',
        author: 'user123',
        comments: [
            { type: 'commenter1', text: 'Great post! ', testing: { nested: 'xd' } },
            { type: 'commenter2', text: 'I agree with this.' },
            { type: 'commenter3', text: 'Thanks for sharing.', testing: { nested: 'data' } },
        ],
    },
    options: {},
};

(async () => {
    try {
        const create = await fetch(`${url}/mutation/upsert`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });
        console.log('Mutation response status:', create.status);
        try { console.log('Mutation response:', await create.json()); } catch(e) { /* ignore JSON parse */ }
    } catch (err) {
        console.error('Request failed:', err);
    }
})();

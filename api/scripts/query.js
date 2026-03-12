const headers = {
    'Content-Type': 'application/json',
    'db-token': 'token_db1',
    'db-name': 'db1'
};

const url = 'http://localhost:8000';
const method = 'POST';

const retrieveBody = {
    source: 'posts',
    output: {
        title: 1,
        content: 1,
        comments: {
            user: 1,
            text: 1,
            testing: {
                nested: 1
            }
        } 
    },
    options: {
        //pagination: { page: 1, limit: 2 },
        list: { sort: { createdAt: 'asc' } },
        //filter: { content: { phrase: 'a' } },
        comments: {
            list: { sort: { createdAt: 'desc' } },
        }
    }
};

(async () => {
    try {
        const res = await fetch(`${url}/inquiry/retrieve`, { method, headers,
            body: JSON.stringify(retrieveBody),
        });
        const json = await res.json();
        console.log(JSON.stringify(json, null, 2));
    } catch (err) {
        console.error('Request failed:', err);
    }
})();

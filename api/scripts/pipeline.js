const axios = require('axios');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const API_BASE_URL = 'http://localhost:8000';
const PROJECT_ID = '2e86b649-1e6e-4aa7-a931-783c9b5f55be';
const SECRET = 'dev-user-secret'; // Default used in ProjectGuard

// Generar un token válido para el ProjectID
const USER_TOKEN = jwt.sign({ id: PROJECT_ID, accountId: 'dev-account' }, SECRET);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${USER_TOKEN}`
    }
});

async function post(url, data) {
    try {
        const response = await api.post(url, data);
        return response.data;
    } catch (error) {
        return error.response ? error.response.data : error.message;
    }
}

(async () => {
    // --- Step 1: Insert 3 Tags ---
    console.log('--- Step 1: Inserting 3 Tags (Master Data) ---');
    const tags = [
        { name: 'Typescript', type: 'language', id: uuidv4() },
        { name: 'NestJS', type: 'framework', id: uuidv4() },
        { name: 'MongoDB', type: 'database', id: uuidv4() }
    ];
    const tagIds = tags.map(t => t.id);

    const tagResponse = await post('/mutation/upsert', {
        source: 'tags',
        input: tags,
        options: { uniques: ['name'] }
    });
    console.log('Tag Insertion Response:', JSON.stringify(tagResponse, null, 2));

    // --- Step 2: Verify Tags ---
    console.log('\n--- Step 2: Verification (Fetching Tags via Inquiry) ---');
    const tagsFetch = await post('/inquiry/retrieve', {
        source: 'tags',
        output: { id: 1, name: 1, type: 1 }
    });
    
    if (tagsFetch && tagsFetch.items) {
        console.log('Retrieved Tags:', JSON.stringify(tagsFetch.items, null, 2));

        // --- Step 4: Create a Post linked to Tags ---
        console.log('\n--- Step 4: Creating a Post with linked Tags ---');
        const postResponse = await post('/mutation/upsert', {
            source: 'posts',
            input: {
                title: 'Mi primer post con NestJS y Mongo',
                content: 'Aprendiendo a usar relaciones Many-to-Many',
                tags: tagIds // El campo ahora se llama tags
            },
            options: {
                bridge: { tags: 'tags' } // Mapeo bridge: campo 'tags' -> colección 'tags'
            }
        });
        console.log('Post Creation Response:', JSON.stringify(postResponse, null, 2));

        // --- Step 5: Fetch Post with Expanded Tags ---
        console.log('\n--- Step 5: Fetching Post with Expanded Tags ---');
        const expandedPost = await post('/inquiry/retrieve', {
            source: 'posts',
            output: {
                id: 1,
                title: 1,
                tags: { id: 1, name: 1, type: 1 } // Expandir campo 'tags'
            },
            options: {
                tags: { 
                    list: { bridge: 'tags' } 
                }
            }
        });
        console.log('Expanded Post Result:', JSON.stringify(expandedPost.items, null, 2));
    } else {
        console.log('Consult response (unexpected structure):', JSON.stringify(tagsFetch, null, 2));
    }
})();
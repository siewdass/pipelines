const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000';

const USER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJlODZiNjQ5LTFlNmUtNGFhNy1hOTMxLTc4M2M5YjVmNTViZSIsImFjY291bnRJZCI6IjI0YzIyOWY2LThjZWMtNDdlMy05MDRlLTc1MTBmYTk0NzMxZiIsImlhdCI6MTc3MzQ0Mzg1NH0.UeBADggLSIZFm0C_8rEn7bRXGgEQfarFLrhjW2reCo4"

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
    // --- Step 1: Insert Dependencies (Tags for Many-To-Many) ---
    console.log('--- Step 1: Inserting Dependencies (Tags) without explicit IDs ---');
    const tags = [
        { name: 'GraphQL', type: 'api' },
        { name: 'PostgreSQL', type: 'database' }
    ];

    await post('/mutation/upsert', {
        source: 'tags',
        input: tags,
        options: { uniques: ['name'] }
    });
    
    // --- Step 1.5: Query the newly generated tags to get their backend-generated IDs ---
    const fetchedTags = await post('/inquiry/retrieve', {
        source: 'tags',
        output: { id: 1, name: 1 },
        options: {
            filter: { name: ['GraphQL', 'PostgreSQL'] }
        }
    });

    const tagIds = fetchedTags.items ? fetchedTags.items.map(t => t.id) : [];
    console.log(`Recuperados ${tagIds.length} IDs autogenerados:`, tagIds);

    // --- Step 2: Create a complex document with ALL relationships at once ---
    console.log('\n--- Step 2: Creating a Post with One-To-One, One-To-Many, and Many-To-Many ---');
    const postResponse = await post('/mutation/upsert', {
        source: 'posts',
        input: {
            title: 'Mastering Relational Data',
            content: 'Demostrando inserción y consulta de 3 tipos de relaciones a la vez.',
            
            // 1) Many-To-Many: Array de IDs que apuntan a una colección (se usa "bridge" en options)
            tags: tagIds,
            
            // 2) One-To-Many: Array de Objetos. Se guardarán en "comments" vinculados a este post.
            comments: [
                { text: '¡Increíble!', user: 'user1' },
                { text: 'Genial aporte.', user: 'user2' }
            ],

            // 3) One-To-One: Un objeto anidado directo. Se guardará en "author" vinculado a este post.
            author: {
                name: 'Alex Jones',
                role: 'Senior Admin',
                age: 35,
                website: 'https://demo.com'
            }
        },
        options: {
            // Mapeo para decir que 'tags' es un array M2M y usa la colección 'tags'
            bridge: { tags: 'tags' },
            // Especificamos que en la relación 'author', el campo 'name' debe ser único
            author: { uniques: ['name'] }
        }
    });

    console.log('Post Creation Response:', JSON.stringify(postResponse, null, 2));

    // --- Step 3: Fetch the Post expanding ALL relationships at once ---
    console.log('\n--- Step 3: Fetching the Post expanding ALL relationships ---');
    const expandedPost = await post('/inquiry/retrieve', {
        source: 'posts',
        output: {
            id: 1,
            title: 1,
            content: 1,
            
            // Expandimos Many-to-Many
            tags: { id: 1, name: 1, type: 1 }, 
            
            // Expandimos One-to-Many
            comments: { id: 1, text: 1, user: 1 },
            
            // Expandimos One-to-One
            author: { id: 1, name: 1, role: 1 }
        },
        options: {
            // "bridge" indica que conectaremos usando la colección pivote M2M
            tags: { list: { bridge: 'tags' } },
            
            // "list" vacío indica que es una búsqueda O2M directa en la colección (todos los que coincidan)
            comments: { list: {} }
            
            // "author" (O2O) no lleva nada. El motor hará automáticamente un .findOne() genérico
        }
    });

    console.log('Expanded Result:', JSON.stringify(expandedPost.items, null, 2));
})();
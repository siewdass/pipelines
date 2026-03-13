const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJlODZiNjQ5LTFlNmUtNGFhNy1hOTMxLTc4M2M5YjVmNTViZSIsImFjY291bnRJZCI6IjI0YzIyOWY2LThjZWMtNDdlMy05MDRlLTc1MTBmYTk0NzMxZiIsImlhdCI6MTc3MzQ0Mzg1NH0.UeBADggLSIZFm0C_8rEn7bRXGgEQfarFLrhjW2reCo4', 
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

(async function run() {
    console.log('--- Step 1: Inserting 3 Tags (Master Data) ---');
    // Nombres fijos para probar la restricción de 'uniques'
    const tagsToCreate = [
        { name: 'Typescript', type: 'language' },
        { name: 'NestJS', type: 'framework' },
        { name: 'MongoDB', type: 'database' }
    ];
    
    // Insertamos los tags con la opción 'uniques' para evitar duplicados
    const tagResponse = await post('/mutation/upsert', {
        source: 'tags',
        input: tagsToCreate,
        options: {
            uniques: ['name'] // El campo 'name' debe ser único
        },
    });

    console.log('Tag Insertion Response:', JSON.stringify(tagResponse, null, 2));

    console.log('--- Step 2: Verification (Fetching Tags) ---');
    const tagsFetch = await post('/database/fetch', {
        collection: 'tags'
    });

    if (tagsFetch.docs) {
        console.log('Retrieved Tags:', JSON.stringify(tagsFetch.docs, null, 2));
        
        const foundNames = tagsFetch.docs.map(t => t.name);
        const allCreated = tagsToCreate.every(t => foundNames.includes(t.name));
        console.log('All tags created successfully:', allCreated);
    } else {
        console.log('Consult response (unexpected structure):', JSON.stringify(tagsFetch, null, 2));
    }
})();
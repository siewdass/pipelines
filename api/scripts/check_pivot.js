const mongoose = require('mongoose');

async function check() {
    const conn = await mongoose.createConnection('mongodb://localhost:27017/2e86b649-1e6e-4aa7-a931-783c9b5f55be');
    await conn.asPromise();

    const db = conn.db;
    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);
    console.log('Collections:', names);

    // Buscamos la tabla pivote correcta: posts_tags
    if (names.includes('posts_tags')) {
        const pivot = await db.collection('posts_tags').find({}).toArray();
        console.log('Relations in posts_tags:', JSON.stringify(pivot, null, 2));
    } else {
        console.log('Collection posts_tags DOES NOT EXIST');
    }

    if (names.includes('schemas')) {
        const allSchemas = await db.collection('schemas').find({}).toArray();
        console.log('Schemas in database:', JSON.stringify(allSchemas, null, 2));
    }

    await conn.close();
}

check().catch(console.error);

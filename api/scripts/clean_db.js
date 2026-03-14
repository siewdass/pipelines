const mongoose = require('mongoose');

async function clean() {
    const conn = await mongoose.createConnection('mongodb://localhost:27017/2e86b649-1e6e-4aa7-a931-783c9b5f55be');
    await conn.asPromise();

    const db = conn.db;
    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);

    // Borramos todo lo relacionado con nuestras pruebas
    const toDelete = ['tags', 'posts', 'posts_tags', 'posts_tag_list', 'schemas', 'associations'];
    
    for (const name of toDelete) {
        if (names.includes(name)) {
            await db.collection(name).drop();
            console.log(`[CLEAN] Dropped collection: ${name}`);
        }
    }

    await conn.close();
    console.log('[CLEAN] Database ready for fresh test.');
}

clean().catch(console.error);

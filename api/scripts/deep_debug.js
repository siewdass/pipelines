const mongoose = require('mongoose');

async function debug() {
    const conn = await mongoose.createConnection(process.env.MONGO_URI || 'mongodb://localhost:27017/default');
    await conn.asPromise();
    
    const admin = conn.db.admin();
    const dbs = await admin.listDatabases();
    const dbNames = dbs.databases.map(d => d.name);
    console.log('--- Scanning all Databases ---');

    for (const name of dbNames) {
        const db = conn.useDb(name);
        const collections = await db.db.listCollections().toArray();
        if (collections.some(c => c.name === 'tags')) {
            const tags = await db.db.collection('tags').find({}).toArray();
            if (tags.length > 0) {
                console.log(`[FOUND] In DB "${name}", tags collection has ${tags.length} docs:`);
                console.log(JSON.stringify(tags.map(t => ({ _id: t._id, name: t.name })), null, 2));
            }
        }
    }

    await conn.close();
}

debug().catch(console.error);

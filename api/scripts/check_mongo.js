const mongoose = require('mongoose');

async function check() {
    const conn = await mongoose.createConnection(process.env.MONGO_URI || 'mongodb://localhost:27017');
    await conn.asPromise();
    
    // Listing databases
    const admin = conn.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Databases:', (dbs.databases || []).map(d => d.name));

    const targetDbName = '2e86b649-1e6e-4aa7-a931-783c9b5f55be';
    console.log(`Checking ${targetDbName}...`);
    
    // In mongoose 6+, createConnection().asPromise() is enough.
    // To switch DB:
    const targetDb = conn.useDb(targetDbName);
    
    const collections = await targetDb.db.listCollections().toArray();
    console.log(`Collections in ${targetDbName}:`, collections.map(c => c.name));

    const tagsCollection = targetDb.db.collection('tags');
    const tags = await tagsCollection.find({}).toArray();
    console.log('Tags found in tags collection:', JSON.stringify(tags, null, 2));

    await conn.close();
}

check().catch(err => {
    console.error('Error during check:', err);
    process.exit(1);
});

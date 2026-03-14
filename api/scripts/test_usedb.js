const mongoose = require('mongoose');

async function test() {
    const MONGO_URI = 'mongodb://localhost:27017/default';
    const projectId = '2e86b649-1e6e-4aa7-a931-783c9b5f55be';
    
    console.log(`Connecting to ${MONGO_URI}...`);
    const baseConnection = mongoose.createConnection(MONGO_URI);
    await baseConnection.asPromise();
    console.log('Base connection ready.');

    console.log(`Using DB ${projectId}...`);
    const connection = baseConnection.useDb(projectId, { useCache: true });
    await connection.asPromise();
    console.log('Project connection ready.');

    const db = connection.db;
    console.log(`DB Name from connection: ${db.databaseName}`);

    const collection = db.collection('tags');
    console.log(`Inserting doc into ${db.databaseName}.tags...`);
    
    const res = await collection.insertOne({ name: 'TEST_MANUAL', type: 'test' });
    console.log('Result:', res);

    const found = await collection.find({ name: 'TEST_MANUAL' }).toArray();
    console.log('Found:', found);

    await baseConnection.close();
}

test().catch(console.error);

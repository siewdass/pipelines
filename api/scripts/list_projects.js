const mongoose = require('mongoose');

async function run() {
    const conn = await mongoose.createConnection('mongodb://localhost:27017/default');
    await conn.asPromise();

    const collections = await conn.db.listCollections().toArray();
    console.log('Collections in default:', collections.map(c => c.name));

    if (collections.some(c => c.name === 'projects')) {
      const projects = await conn.db.collection('projects').find({}).toArray();
      console.log('Projects count:', projects.length);
      console.log('Project IDs:', projects.map(p => p._id));
    } else {
      console.log('No "projects" collection found in default DB.');
    }

    await conn.close();
}

run().catch(console.error);

const mongoose = require('mongoose');

async function debug() {
    const conn = await mongoose.createConnection('mongodb://localhost:27017/2e86b649-1e6e-4aa7-a931-783c9b5f55be');
    await conn.asPromise();

    const pivot = await conn.db.collection('posts_tag_list').find({}).toArray();
    console.log('--- CONTENT OF posts_tag_list ---');
    console.log(JSON.stringify(pivot, null, 2));

    const post = await conn.db.collection('posts').findOne({});
    console.log('--- FIRST POST ---');
    console.log(JSON.stringify(post, null, 2));

    await conn.close();
}

debug().catch(console.error);

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const OLD_DB_URI = 'mongodb://localhost:27017/polling-platform';
const NEW_DB_URI = 'mongodb://localhost:27017/pulse-polling-system';

async function migrate() {
  let oldConn, newConn;
  try {
    console.log('Connecting to old database...');
    oldConn = await mongoose.createConnection(OLD_DB_URI).asPromise();
    console.log('Connecting to new database...');
    newConn = await mongoose.createConnection(NEW_DB_URI).asPromise();

    const collections = ['users', 'polls', 'exams', 'surveys', 'comments', 'votes'];

    for (const colName of collections) {
      console.log(`Migrating collection: ${colName}...`);
      const oldCollection = oldConn.collection(colName);
      const newCollection = newConn.collection(colName);

      const data = await oldCollection.find({}).toArray();
      console.log(`Found ${data.length} items in ${colName}.`);
      
      if (data.length > 0) {
        // Clear existing in new to avoid unique constraint errors during sync
        // await newCollection.deleteMany({});
        
        // Insert only those that don't exist yet to be safe
        for (const item of data) {
           const exists = await newCollection.findOne({ _id: item._id });
           if (!exists) {
              await newCollection.insertOne(item);
           }
        }
        console.log(`✅ Successfully synced ${colName}.`);
      }
    }

    console.log('🎉 Full Migration Sequencing Complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Critical Error:', err);
    process.exit(1);
  }
}

migrate();

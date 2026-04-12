import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Configuration - Target ALL potential old database names seen in Compass
const OLD_DB_NAMES = ['polling-platform', 'polling-system'];
const NEW_DB_URI = 'mongodb://localhost:27017/pulse-polling-system';
const BASE_URI = 'mongodb://localhost:27017/';

async function superMerge() {
  let newConn;
  try {
    console.log('🚀 INITIALIZING SUPER MERGE SEQUENCE...');
    newConn = await mongoose.createConnection(NEW_DB_URI).asPromise();
    console.log('Connected to TARGET DB: pulse-polling-system');

    const collections = ['users', 'polls', 'exams', 'surveys', 'comments', 'votes', 'submissions', 'surveyresponses'];

    for (const dbName of OLD_DB_NAMES) {
      console.log(`\n📂 PROCESSING SOURCE DB: ${dbName}...`);
      const oldConn = await mongoose.createConnection(BASE_URI + dbName).asPromise();
      
      for (const colName of collections) {
        const oldCollection = oldConn.collection(colName);
        const newCollection = newConn.collection(colName);

        const data = await oldCollection.find({}).toArray();
        if (data.length === 0) continue;

        console.log(`- Found ${data.length} items in [${colName}]`);
        let syncedCount = 0;
        
        for (const item of data) {
           const exists = await newCollection.findOne({ _id: item._id });
           if (!exists) {
              try {
                 // Check if it's a user and if the email already exists in target
                 if (colName === 'users') {
                    const sameEmail = await newCollection.findOne({ email: item.email });
                    if (sameEmail) continue; 
                 }
                 await newCollection.insertOne(item);
                 syncedCount++;
              } catch (e) {
                 // Skip duplicates gracefully
              }
           }
        }
        console.log(`  ✅ Synced ${syncedCount} new records to ${colName}.`);
      }
      await oldConn.close();
    }

    console.log('\n✨ SUPER MERGE COMPLETE. ALL NEURAL LINKS RESTORED.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Super Merge Failure:', err);
    process.exit(1);
  }
}

superMerge();

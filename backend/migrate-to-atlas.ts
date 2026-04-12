import mongoose from 'mongoose';

// Your Local Database
const OLD_DB_URI = 'mongodb://localhost:27017/pulse-polling-system';
// Your Cloud Database
const NEW_DB_URI = 'mongodb+srv://priyanshukr988_db_user:Priyanshu12345@cluster0.cldtjb3.mongodb.net/pulse-polling-system?retryWrites=true&w=majority';

async function syncToAtlas() {
  let oldConn, newConn;
  try {
    console.log('🔗 Connecting to Local Compass Database...');
    oldConn = await mongoose.createConnection(OLD_DB_URI).asPromise();
    
    console.log('☁️ Connecting to MongoDB Atlas Cloud...');
    newConn = await mongoose.createConnection(NEW_DB_URI).asPromise();

    const collections = ['users', 'polls', 'exams', 'surveys', 'comments', 'votes', 'examresults', 'surveyresults'];

    for (const colName of collections) {
      console.log(`\n📦 Syncing collection: ${colName}...`);
      const oldCollection = oldConn.collection(colName);
      const newCollection = newConn.collection(colName);

      // Check if old collection exists
      const collectionsList = await oldConn.db!.listCollections({ name: colName }).toArray();
      if (collectionsList.length === 0) {
        console.log(`Skipping ${colName} (Does not exist locally)`);
        continue;
      }

      const data = await oldCollection.find({}).toArray();
      console.log(`Found ${data.length} documents locally.`);
      
      let inserted = 0;
      if (data.length > 0) {
        for (const item of data) {
           const exists = await newCollection.findOne({ _id: item._id });
           if (!exists) {
              try {
                 await newCollection.insertOne(item);
                 inserted++;
              } catch (e: any) {
                 if (e.code === 11000) {
                     console.log(`⚠️ Skipped duplicate unique key constraint (e.g. Email already taken in cloud for: ${item._id})`);
                 } else {
                     throw e;
                 }
              }
           }
        }
        console.log(`✅ Successfully uploaded ${inserted} new documents to Atlas.`);
      }
    }

    console.log('\n🎉 ALL DATA HAS BEEN MIGRATED TO THE CLOUD SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Critical Error:', err);
    process.exit(1);
  }
}

syncToAtlas();

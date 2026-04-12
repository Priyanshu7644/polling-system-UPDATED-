const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcryptjs');

const url = 'mongodb://localhost:27017';
const dbName = 'pulse-polling-system';

async function forceReset() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    
    // Hash new password "123"
    const hashedPassword = await bcrypt.hash('123', 10);
    
    const targets = ['demo1@gmail.com', 'demo2@gmail.com'];
    
    for (const email of targets) {
       const result = await db.collection('users').updateOne(
         { email: email },
         { $set: { password: hashedPassword, isVerified: true } }
       );
       console.log(`Update Result for ${email}:`, result.matchedCount > 0 ? '✅ SUCCESS' : '❌ NOT FOUND');
    }
  } catch (err) {
    console.error('Error during manual override:', err);
  } finally {
    await client.close();
  }
}

forceReset();

const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcryptjs');

const url = 'mongodb://localhost:27017';
const dbName = 'pulse-polling-system';

async function updatePassword() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    
    // Hash new password
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const result = await db.collection('users').updateOne(
      { email: 'demo1@gmail.com' },
      { $set: { password: hashedPassword, isVerified: true } }
    );
    
    console.log('Update Result:', result);
    if (result.matchedCount > 0) {
      console.log('✅ Found user. Modified count:', result.modifiedCount);
    } else {
      console.log('❌ No user found with that email.');
    }
  } catch (err) {
    console.error('Error during update:', err);
  } finally {
    await client.close();
  }
}

updatePassword();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/polling-platform';

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Manually define User schema since it's a JS script
    const User = mongoose.model('User', new mongoose.Schema({
      isVerified: { type: Boolean, default: false }
    }, { strict: false }));

    const result = await User.updateMany(
      { isVerified: { $exists: false } }, 
      { $set: { isVerified: true } }
    );

    console.log(`Migration complete: ${result.modifiedCount} legacy users verified.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();

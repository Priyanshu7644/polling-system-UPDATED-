const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/pulse-polling-system')
  .then(async () => {
    console.log("Connected to MongoDB.");
    const db = mongoose.connection.db;
    const result = await db.collection('exams').updateMany(
      {},
      { $set: { proctoringLevel: 'none' } } // User requested ALL existing to be 'none'
    );
    console.log(`Successfully patched ${result.modifiedCount} old exams to 'none'.`);
    process.exit(0);
  })
  .catch(err => {
    console.error("Failed to connect:", err);
    process.exit(1);
  });

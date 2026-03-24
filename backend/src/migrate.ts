import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Poll } from './models/Poll';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/polling-platform';

async function migrateCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB. Starting category migration...');

    const polls = await Poll.find();
    console.log(`Found ${polls.length} polls to categorize.`);

    for (const poll of polls) {
      let category = 'Other';
      const text = `${poll.title} ${poll.description}`.toLowerCase();

      if (text.includes('ipl') || text.includes('cricket') || text.includes('sports') || text.includes('fitness') || text.includes('yoga')) {
        category = 'Sports & Health';
      } else if (text.includes('programming') || text.includes('it & ai') || text.includes('smartphone') || text.includes('tech') || text.includes('app') || text.includes('crypto')) {
        category = 'Technology';
      } else if (text.includes('food') || text.includes('tea') || text.includes('coffee') || text.includes('restaurant') || text.includes('calories')) {
        category = 'Food & Drink';
      } else if (text.includes('actor') || text.includes('cinema') || text.includes('ott') || text.includes('movie') || text.includes('music') || text.includes('show')) {
        category = 'Entertainment';
      } else if (text.includes('political') || text.includes('policy') || text.includes('legal') || text.includes('tax') || text.includes('government')) {
        category = 'Politics';
      } else if (text.includes('holiday') || text.includes('commute') || text.includes('work') || text.includes('school') || text.includes('life')) {
        category = 'Lifestyle';
      }

      await Poll.findByIdAndUpdate(poll._id, { category });
    }

    console.log('Migration complete! All polls categorized.');
    process.exit(0);

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateCategories();

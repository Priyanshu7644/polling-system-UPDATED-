import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pulse-polling-system';

// Define Schemas Locally for Seeding (to avoid import issues)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const pollSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, default: 'Other' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  options: [{ text: String, votes: { type: Number, default: 0 } }],
  isPublic: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const examSchema = new mongoose.Schema({
  title: String,
  description: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questions: [{ questionText: String, options: [String], correctAnswer: Number }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Poll = mongoose.model('Poll', pollSchema);
const Exam = mongoose.model('Exam', examSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    
    // 1. Clear existing data to ensure a fresh start
    // await Poll.deleteMany({});
    // await Exam.deleteMany({});
    
    // 2. Create or Get System Admin User
    let admin = await User.findOne({ username: 'SystemAdmin' });
    if (!admin) {
      console.log('Creating System Admin user...');
      const hashedPassword = await bcrypt.hash('Admin@Pulse2026', 10);
      admin = new User({
        username: 'SystemAdmin',
        email: 'admin@pulse.io',
        password: hashedPassword,
        isVerified: true
      });
      await admin.save();
    }

    // 3. Seed Polls
    const pollCount = await Poll.countDocuments({});
    if (pollCount < 5) {
      console.log('Seeding Polls...');
      const mockPolls = [
        {
          title: "Ultimate Polling Platform Era?",
          description: "Will community-driven platforms replace traditional surveys?",
          creator: admin._id,
          category: "Technology",
          options: [{ text: "Definitely" }, { text: "Co-existence" }, { text: "Traditional holds" }],
          isPublic: true
        },
        {
          title: "Best Programming Language 2026",
          description: "Vote for the language dominating the AI landscape.",
          creator: admin._id,
          category: "Development",
          options: [{ text: "TypeScript" }, { text: "Rust" }, { text: "Mojo" }, { text: "Python (Legacy)" }],
          isPublic: true
        },
        {
          title: "Remote vs Office: Final Verdict",
          description: "Two years after the global shift, where do we stand?",
          creator: admin._id,
          category: "Social",
          options: [{ text: "Fully Remote" }, { text: "Hybrid Pulse" }, { text: "Office Standard" }],
          isPublic: true
        }
      ];
      await Poll.insertMany(mockPolls);
    }

    // 4. Seed Exams
    const examCount = await Exam.countDocuments({});
    if (examCount === 0) {
      console.log('Seeding Exams...');
      const mockExams = [
        {
          title: "Cyber Security Fundamentals",
          description: "Test your knowledge on neural link security and data encryption.",
          creator: admin._id,
          questions: [
            { questionText: "What is the primary key in a JWT?", options: ["Payload", "Header", "Signature", "All of the above"], correctAnswer: 3 }
          ]
        },
        {
          title: "Full-Stack Architecture 2026",
          description: "Advanced concepts in distributed polling systems.",
          creator: admin._id,
          questions: [
            { questionText: "Which protocol is best for real-time poll updates?", options: ["REST", "WebSockets", "GraphQL Query", "Email"], correctAnswer: 1 }
          ]
        }
      ];
      await Exam.insertMany(mockExams);
    }

    console.log('✅ Master Seeding Sequence Complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failure:', err);
    process.exit(1);
  }
}

seed();

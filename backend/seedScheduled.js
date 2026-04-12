const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/polling-platform');
  const db = mongoose.connection.db;
  
  const teachers = await db.collection('users').find({}).toArray();
  const teacherId = teachers[0]?._id;
  
  if (!teacherId) {
    console.error('No teacher found. Script failed.');
    process.exit(1);
  }

  const now = new Date();
  const startTime = new Date(now.getTime() - 60000); // Started 1 minute ago
  const endTime = new Date(now.getTime() + 3600000); // Ends in 1 hour

  const scheduledExam = {
    title: 'Scheduled Midterm Examination',
    description: 'This is a strictly scheduled examination. The start window is currently active.',
    teacher: teacherId,
    startTime: startTime,
    endTime: endTime,
    duration: 60,
    examType: 'scheduled',
    attemptsLimit: 1,
    status: 'published',
    questions: [
      { text: 'Which planet is known as the Red Planet?', type: 'objective', options: ['Jupiter', 'Mars', 'Venus', 'Saturn'], correctAnswerIndex: 1, marks: 5 },
      { text: 'Detail the impact of industrial revolution on modern software architecture.', type: 'subjective', marks: 15 }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('exams').insertOne(scheduledExam);
  console.log('Seeded a non-universal scheduled exam successfully.');
  process.exit();
}

seed();

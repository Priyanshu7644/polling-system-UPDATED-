const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/polling-platform');
  const db = mongoose.connection.db;
  
  // Find or create a teacher user
  let teachers = await db.collection('users').find({}).toArray();
  let teacherId;
  
  if (teachers.length === 0) {
    const result = await db.collection('users').insertOne({
       username: 'DefaultTeacher',
       email: 'teacher@pulse.com',
       password: '$2b$10$O6O0iBeb7s6C0I1z6u0i.OtLq8y6I1G8.F/6qI1e5K/6.6qI1e5K/', // 'password' hashed
       avatar: '',
       createdAt: new Date(),
       updatedAt: new Date()
    });
    teacherId = result.insertedId;
  } else {
    teacherId = teachers[0]._id;
  }

  const exams = [
    {
      title: 'Universal Practice Exam Alpha',
      description: 'Anytime access, unlimited attempts. Pure experimentation.',
      teacher: teacherId,
      startTime: new Date('2024-01-01'),
      endTime: new Date('2030-01-01'),
      duration: 120,
      examType: 'anytime',
      attemptsLimit: 0,
      status: 'published',
      questions: [
        { text: 'What is the capital of Mars?', type: 'objective', options: ['Elonville', 'Bezos-bad', 'No Capital', 'Red City'], correctAnswerIndex: 2, marks: 5 },
        { text: 'Explain the concept of quantum entanglement in one sentence.', type: 'subjective', marks: 10 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Universal Practice Exam Beta',
      description: 'Anytime access, unlimited attempts. Master the basics.',
      teacher: teacherId,
      startTime: new Date('2024-01-01'),
      endTime: new Date('2030-01-01'),
      duration: 45,
      examType: 'anytime',
      attemptsLimit: 0,
      status: 'published',
      questions: [
        { text: '2 + 2 = ?', type: 'objective', options: ['3', '4', '5', 'Fish'], correctAnswerIndex: 1, marks: 2 },
        { text: 'Describe your favorite color using only sounds.', type: 'subjective', marks: 8 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Universal Challenge (Single Attempt)',
      description: 'Anytime access, but only ONE chance to get it right.',
      teacher: teacherId,
      startTime: new Date('2024-01-01'),
      endTime: new Date('2030-01-01'),
      duration: 30,
      examType: 'anytime',
      attemptsLimit: 1,
      status: 'published',
      questions: [
        { text: 'Which element has the atomic number 1?', type: 'objective', options: ['He', 'H', 'Li', 'Be'], correctAnswerIndex: 1, marks: 5 },
        { text: 'What would happen if the moon disappeared tomorrow?', type: 'subjective', marks: 15 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.collection('exams').insertMany(exams);
  console.log('Seeded 3 universal exams successfully.');
  process.exit();
}

seed();

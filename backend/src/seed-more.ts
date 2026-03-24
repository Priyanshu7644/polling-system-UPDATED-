  import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Exam } from './models/Exam';
import { Survey } from './models/Survey';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/polling-platform';

const examData = [
  {
    title: "JavaScript Fundamentals Quiz",
    description: "Test your knowledge on basic JS concepts.",
    questions: [
      { text: "Which keyword defines a block-level variable?", options: ["var", "let", "function", "module"], correctAnswerIndex: 1 },
      { text: "What is the output of typeof null?", options: ["null", "undefined", "object", "string"], correctAnswerIndex: 2 },
      { text: "Which method adds an element to the end of an array?", options: ["push()", "pop()", "shift()", "unshift()"], correctAnswerIndex: 0 },
      { text: "How do you write an IF statement in JS?", options: ["if i = 5", "if (i == 5)", "if i == 5 then", "if i = 5 then"], correctAnswerIndex: 1 }
    ]
  },
  {
    title: "World Geography Challenge",
    description: "Are you a master of the map?",
    questions: [
      { text: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correctAnswerIndex: 2 },
      { text: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correctAnswerIndex: 1 },
      { text: "Mount Everest is located in which mountain range?", options: ["Alps", "Rockies", "Andes", "Himalayas"], correctAnswerIndex: 3 }
    ]
  },
  {
    title: "React Hooks Masterclass",
    description: "Evaluate your modern React skills.",
    questions: [
      { text: "Which hook is used for side effects?", options: ["useState", "useEffect", "useContext", "useRef"], correctAnswerIndex: 1 },
      { text: "What does useState return?", options: ["An array with value and setter", "An object", "A string", "A boolean"], correctAnswerIndex: 0 },
      { text: "Which hook replaces shouldComponentUpdate?", options: ["useMemo", "useCallback", "React.memo", "Both useMemo and React.memo"], correctAnswerIndex: 3 }
    ]
  },
  {
    title: "Basic Mathematics Knowledge",
    description: "Check your arithmetics logic.",
    questions: [
      { text: "What is 15 * 12?", options: ["150", "175", "180", "200"], correctAnswerIndex: 2 },
      { text: "Square root of 225?", options: ["15", "25", "35", "5"], correctAnswerIndex: 0 },
      { text: "Which number is a prime number?", options: ["9", "15", "21", "29"], correctAnswerIndex: 3 }
    ]
  },
  {
    title: "General Knowledge 2026",
    description: "Stay updated with current events.",
    questions: [
      { text: "Which company developed ChatGPT?", options: ["Google", "Facebook", "OpenAI", "Microsoft"], correctAnswerIndex: 2 },
      { text: "What is the capital of Japan?", options: ["Seoul", "Beijing", "Tokyo", "Osaka"], correctAnswerIndex: 2 },
      { text: "Which planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Saturn", "Mars"], correctAnswerIndex: 3 }
    ]
  }
];

const surveyData = [
  {
    title: "Remote Work Satisfaction Survey",
    description: "Tell us how you feel about working from home.",
    isAnonymous: true,
    questions: [
      { type: "mcq", text: "How often do you work remotely?", options: ["Always", "Mostly", "Sometimes", "Never"], required: true },
      { type: "text", text: "What is your biggest challenge with remote work?", required: false },
      { type: "mcq", text: "Do you feel you are more productive at home?", options: ["More productive", "Less productive", "About the same"], required: true }
    ]
  },
  {
    title: "Tech Stack Preferences 2026",
    description: "A quick survey for modern developers.",
    isAnonymous: false,
    questions: [
      { type: "mcq", text: "Primary frontend framework?", options: ["React", "Vue", "Angular", "Svelte"], required: true },
      { type: "mcq", text: "Primary backend language?", options: ["Node.js", "Python", "Go", "Java"], required: true },
      { type: "text", text: "What tool can you not live without?", required: true }
    ]
  },
  {
    title: "Mental Health & Workplace",
    description: "Help us understand workplace dynamics and stress.",
    isAnonymous: true,
    questions: [
      { type: "mcq", text: "How would you rate your typical stress level?", options: ["Low", "Moderate", "High", "Very High"], required: true },
      { type: "mcq", text: "Does your company provide mental health days?", options: ["Yes", "No", "Not sure"], required: true },
      { type: "text", text: "What changes would improve your well-being?", required: false }
    ]
  },
  {
    title: "Customer Experience Feedback",
    description: "We want to hear about your latest purchase.",
    isAnonymous: false,
    questions: [
      { type: "mcq", text: "How satisfied are you with our product?", options: ["Very Satisfied", "Neutral", "Dissatisfied"], required: true },
      { type: "text", text: "Any additional comments or suggestions?", required: false },
      { type: "mcq", text: "Would you recommend us to a friend?", options: ["Yes", "No", "Maybe"], required: true }
    ]
  },
  {
    title: "Fitness Habits Survey",
    description: "Tracking community lifestyle metrics.",
    isAnonymous: false,
    questions: [
      { type: "mcq", text: "How many times a week do you exercise?", options: ["0", "1-2", "3-4", "5+"], required: true },
      { type: "mcq", text: "What is your primary mode of exercise?", options: ["Weightlifting", "Cardio", "Yoga", "Sports"], required: true },
      { type: "text", text: "What are your fitness goals for this year?", required: false }
    ]
  }
];

async function seedMore() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Clear existing to avoid duplicates
    await Exam.deleteMany({});
    await Survey.deleteMany({});
    console.log('Cleared existing mock quizzes and surveys.');

    let users = await User.find();
    if (users.length === 0) {
      console.error('No users found! Please run the main seed script first or create an account.');
      process.exit(1);
    }
    console.log(`Found ${users.length} users. Assigning random creators...`);

    // 1. Insert Quizzes (Exams)
    console.log('Inserting mock quizzes...');
    const now = new Date();
    // One active quiz, some scheduled, some ended
    for (let i = 0; i < examData.length; i++) {
      const data = examData[i];
      let startTime = new Date(now);
      let endTime = new Date(now);
      
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      if (i === 0) {
        // Active now
        startTime.setHours(startTime.getHours() - 1);
        endTime.setHours(endTime.getHours() + 2);
      } else if (i === 1 || i === 2) {
        // Concluded
        startTime.setDate(startTime.getDate() - 2);
        endTime.setDate(endTime.getDate() - 1);
      } else {
        // Scheduled
        startTime.setDate(startTime.getDate() + 1);
        endTime.setDate(endTime.getDate() + 2);
      }

      const exam = new Exam({
        title: data.title,
        description: data.description,
        teacher: randomUser._id,
        startTime,
        endTime,
        questions: data.questions,
        status: 'published'
      });
      await exam.save();
    }
    console.log('Exams seeded successfully!');

    // 2. Insert Surveys
    console.log('Inserting mock surveys...');
    for (let i = 0; i < surveyData.length; i++) {
      const data = surveyData[i];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      const survey = new Survey({
        title: data.title,
        description: data.description,
        creator: randomUser._id,
        questions: data.questions,
        isAnonymous: data.isAnonymous,
        status: 'published'
      });
      await survey.save();
    }
    console.log('Surveys seeded successfully!');

    console.log('Finished seeding additional mock data.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedMore();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Poll } from './models/Poll';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/polling-platform';

const indianNames = [
  "Aarav Sharma", "Vivaan Gupta", "Aditya Singh", "Vihaan Patel", "Arjun Reddy",
  "Sai Kumar", "Reyansh Verma", "Ayaan Joshi", "Krishna Iyer", "Ishaan Kapoor",
  "Shaurya Bhatia", "Atharva Desai", "Aanya Das", "Ananya Menon", "Diya Pillai",
  "Aditi Rao", "Sneha Nair", "Riya Mishra", "Neha Pandey", "Kavya Ahuja",
  "Pooja Saxena", "Priya Kulkarni", "Rahul Mehra", "Rohit Agarwal", "Amit Bose",
  "Vikas Nambiar", "Manish Tiwari", "Sunil Jain", "Anil Chauhan", "Deepak Yadav",
  "Rakesh Thakur", "Ramesh Sen", "Suresh Dubey", "Sanjay Chawla", "Mahesh Babu",
  "Dinesh Karthik", "Ravi Teja", "Vijay Shankar", "Harish Kalyan", "Prakash Raj",
  "Nitin Mukesh", "Siddharth Malhotra", "Karan Johar", "Rajesh Khanna", "Sushant Rajput",
  "Prabhas Raju", "Ram Charan", "Allu Arjun", "Naga Chaitanya", "Shiva Rajkumar"
];

const pollData = [
  { title: "Who will win the IPL next season?", desc: "Cricket fever is on!", options: ["CSK", "Mumbai Indians", "RCB", "KKR"] },
  { title: "Best programming language for beginners?", desc: "Looking to start a career in IT.", options: ["Python", "JavaScript", "Java", "C++"] },
  { title: "Favorite Indian street food?", desc: "What's your go-to evening snack?", options: ["Pani Puri", "Vada Pav", "Samosa", "Chaat"] },
  { title: "Preferred mode of transport for daily commute?", desc: "In major metropolitan cities.", options: ["Metro", "Bus", "Two-wheeler", "Car"] },
  { title: "Best OTT streaming platform in India?", desc: "Where do you binge-watch?", options: ["Netflix", "Prime Video", "Hotstar", "JioCinema"] },
  { title: "Do you prefer working from home or office?", desc: "Post-pandemic work culture.", options: ["WFH completely", "Office full-time", "Hybrid model"] },
  { title: "Favorite holiday destination in India?", desc: "Planning my next vacation.", options: ["Goa", "Kerala Backwaters", "Himachal Mountains", "Rajasthan Forts"] },
  { title: "What is your primary source of news?", desc: "Staying updated in 2026.", options: ["TV News Channels", "Newspapers", "Social Media (X, Insta)", "News Apps"] },
  { title: "Best smartphone brand under ₹20,000?", desc: "Budget king?", options: ["Xiaomi/Redmi", "Realme", "Samsung", "Motorola"] },
  { title: "Which superhero universe do you prefer?", desc: "The ultimate showdown.", options: ["Marvel (MCU)", "DC (DCEU)", "None, I like comics"] },
  { title: "Should schools teach financial literacy?", desc: "Taxes, investing, etc.", options: ["Absolutely, it's essential", "Maybe as an elective", "No, keep traditional subjects"] },
  { title: "Favorite Bollywood actor of this generation?", desc: "Who rules the box office?", options: ["Ranbir Kapoor", "Ranveer Singh", "Ayushmann Khurrana", "Kartik Aaryan"] },
  { title: "Best way to spend a Sunday?", desc: "Relaxing on the weekend.", options: ["Sleeping all day", "Going out with friends", "Watching movies/series", "Reading a book"] },
  { title: "Do you believe in extraterrestrial life (Aliens)?", desc: "Are we alone?", options: ["Yes, universe is too big", "No, we are unique", "Unsure"] },
  { title: "Favorite beverage in the morning?", desc: "Starting the day right.", options: ["Masala Chai", "Filter Coffee", "Green Tea", "Black Coffee"] },
  { title: "Which sector will see the most growth in India by 2030?", desc: "Economic predictions.", options: ["IT & AI Tech", "Renewable Energy", "Healthcare", "Manufacturing"] },
  { title: "Should cryptocurrency be fully legalized in India?", desc: "Crypto regulation debate.", options: ["Yes, fully embrace it", "Yes, but highly regulated", "No, ban it completely"] },
  { title: "Best Indian captain of all time?", desc: "Cricket legends.", options: ["MS Dhoni", "Sourav Ganguly", "Virat Kohli", "Kapil Dev"] },
  { title: "Are EVs (Electric Vehicles) the future?", desc: "Automotive trends.", options: ["Yes, totally", "Hybrid is the real future", "No, hydrogen is better"] },
  { title: "Favorite fast food chain in India?", desc: "Quick bites.", options: ["McDonald's", "Domino's", "KFC", "Burger King"] },
  { title: "Do social media algorithms manipulate choices?", desc: "Tech ethics.", options: ["Yes, heavily", "Somewhat", "No, we have free will"] },
  { title: "Best city to live for IT professionals?", desc: "Tech hubs of India.", options: ["Bengaluru", "Hyderabad", "Pune", "Gurgaon"] },
  { title: "Which generation had the best music?", desc: "Nostalgia hits.", options: ["70s/80s Retro", "90s Melodies", "2000s Pop", "Current Generation"] },
  { title: "Should a 4-day workweek be standardized?", desc: "Work-life balance.", options: ["Yes, definitely", "No, will reduce productivity", "Depends on the industry"] },
  { title: "Favorite hobby during free time?", desc: "What keeps you busy?", options: ["Gaming", "Cooking/Baking", "Sports/Fitness", "Music/Art"] },
  { title: "Is artificial intelligence a threat to jobs?", desc: "AI revolution.", options: ["Yes, major job losses", "No, will create new jobs", "Only for redundant tasks"] },
  { title: "Best online shopping site?", desc: "E-commerce giants.", options: ["Amazon", "Flipkart", "Myntra", "Meesho"] },
  { title: "Favorite genre of movies/series?", desc: "What to watch?", options: ["Action/Thriller", "Comedy", "Sci-Fi/Fantasy", "Drama/Romance"] },
  { title: "Should coding be mandatory in schools?", desc: "Education reforms.", options: ["Yes, from primary school", "Yes, but from high school", "No, should be optional"] },
  { title: "Best payment method for daily transactions?", desc: "Fintech usage.", options: ["UPI / PhonePe / GPay", "Credit/Debit Cards", "Cash", "Net Banking"] },
  { title: "Do you prefer reading physical books or e-books?", desc: "Reading habits.", options: ["Physical Books", "Kindle/E-books", "Audiobooks"] },
  { title: "Favorite regional cinema industry?", desc: "Beyond Bollywood.", options: ["Tollywood (Telugu)", "Kollywood (Tamil)", "Mollywood (Malayalam)", "Sandalwood (Kannada)"] },
  { title: "What is your main fitness activity?", desc: "Staying healthy.", options: ["Gym/Weightlifting", "Yoga", "Running/Jogging", "None"] },
  { title: "Are climate change policies effective enough?", desc: "Global warming.", options: ["No, doing too little", "Yes, making progress", "It's all a hoax"] },
  { title: "Favorite social media platform?", desc: "Where do you spend most time?", options: ["Instagram", "WhatsApp", "X (Twitter)", "LinkedIn"] },
  { title: "Should exams be completely digitized?", desc: "Paperless education.", options: ["Yes, saves paper & time", "No, prone to cheating/glitches", "Hybrid approach"] },
  { title: "Best time to wake up in the morning?", desc: "Morning routines.", options: ["Before 6 AM", "6 AM - 8 AM", "After 8 AM"] },
  { title: "Do you invest in the Stock Market?", desc: "Financial habits.", options: ["Yes, regularly (SIPs/Equities)", "Sometimes", "No, too risky"] },
  { title: "Favorite Indian reality TV show?", desc: "Guilty pleasures.", options: ["Bigg Boss", "Shark Tank India", "Indian Idol / KBC", "None"] },
  { title: "Should public transport be free for everyone?", desc: "Urban planning.", options: ["Yes, reduces traffic & pollution", "No, bad for economy", "Only for students/elderly"] },
  { title: "Best feature of modern smartphones?", desc: "Tech advancements.", options: ["Cameras", "Battery/Fast Charging", "Processing Speed (Gaming)", "Display Quality"] },
  { title: "Do you prefer ordering food or eating at restaurants?", desc: "Dining preferences.", options: ["Swiggy/Zomato (Delivery)", "Dine-in experience", "Cooking at home"] },
  { title: "Favorite board game?", desc: "Indoor fun.", options: ["Chess", "Ludo", "Monopoly", "Carrom"] },
  { title: "Should space exploration be funded more?", desc: "ISRO/NASA budgets.", options: ["Yes, vital for humanity", "No, fix Earth problems first", "Keep funding as is"] },
  { title: "Best season in India?", desc: "Weather preferences.", options: ["Winter", "Monsoon", "Summer", "Spring/Autumn"] },
  { title: "Do you track your daily calories/macros?", desc: "Diet tracking.", options: ["Yes, strictly", "Sometimes", "Never"] },
  { title: "Favorite programming IDE/Editor?", desc: "Developer tools.", options: ["VS Code", "IntelliJ / WebStorm", "Sublime Text", "Vim/Neovim"] },
  { title: "Should homework be banned for primary students?", desc: "Childhood stress.", options: ["Yes, let them play", "No, needed for practice", "Reduce the amount"] },
  { title: "Best mode to learn a new skill?", desc: "Upskilling.", options: ["YouTube Videos", "Paid Courses (Udemy/Coursera)", "Reading Documentation", "Bootcamps"] },
  { title: "Do you believe ghost/supernatural entities exist?", desc: "Spooky stuff.", options: ["Yes, absolutely", "No, logic only", "I've had weird experiences"] }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB. Starting seed process...');

    // 1. Create Users
    const createdUsers = [];
    const passwordHash = await bcrypt.hash('password123', 10);

    console.log('Generating 50 fake users...');
    for (let i = 0; i < indianNames.length; i++) {
      const name = indianNames[i];
      const username = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 999);
      const email = `${username}@example.com`;
      
      const user = new User({
        username,
        email,
        password: passwordHash,
      });
      await user.save();
      createdUsers.push(user);
    }
    console.log(`Successfully created ${createdUsers.length} users.`);

    // 2. Create Polls with Votes
    console.log('Generating 50 realistic polls with fake votes...');
    let pollCount = 0;

    for (let i = 0; i < pollData.length; i++) {
        // Pick a random creator for this poll
        const randomCreator = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        
        // Pick a random category
        const categories = ['Politics', 'Sports', 'Technology', 'Entertainment', 'Science', 'Health', 'Education', 'Social'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];

        // Structure options with initial 0 votes
        const pollOpts = pollData[i].options.map(opt => ({ text: opt, votes: 0 }));

        // Distribute 90-100 votes randomly across these options
        const totalFakeVotes = Math.floor(Math.random() * 11) + 90; // 90 to 100
        
        // Randomly assign votes to options
        for (let v = 0; v < totalFakeVotes; v++) {
            const randomOptionIndex = Math.floor(Math.random() * pollOpts.length);
            pollOpts[randomOptionIndex].votes += 1;
        }

        const poll = new Poll({
            title: pollData[i].title,
            description: pollData[i].desc,
            category: randomCategory,
            options: pollOpts,
            creator: randomCreator._id,
            isPublic: true
        });

        await poll.save();
        pollCount++;
    }

    console.log(`Successfully created ${pollCount} polls populated with realistic votes.`);
    console.log('Seeding complete! Exiting...');
    process.exit(0);

  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();

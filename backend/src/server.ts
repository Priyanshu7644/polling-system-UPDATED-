import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

import authRoutes from './routes/auth';
import pollRoutes from './routes/polls';
import commentRoutes from './routes/comments';
import examRoutes from './routes/exams';
import surveyRoutes from './routes/surveys';
import analyticsRoutes from './routes/analytics';

app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Routes definition
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.send('Polling API is running...');
});

// Socket.io connection
let connectedUsers = 0;
io.on('connection', (socket) => {
  connectedUsers++;
  io.emit('liveUsers', connectedUsers);
  
  socket.on('disconnect', () => {
    connectedUsers--;
    io.emit('liveUsers', connectedUsers);
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/polling-platform';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

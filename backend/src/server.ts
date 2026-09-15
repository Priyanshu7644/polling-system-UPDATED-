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
    origin: '*',
    methods: ['GET', 'POST']
  }
});

import authRoutes from './routes/auth';
import pollRoutes from './routes/polls';
import commentRoutes from './routes/comments';
import examRoutes from './routes/exams';
import surveyRoutes from './routes/surveys';
import analyticsRoutes from './routes/analytics';
import userRoutes from './routes/users';
import { startKeepAlive } from './utils/keepAlive';

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
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Polling API is running...' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    dbConnected: mongoose.connection.readyState === 1
  });
});

// Socket.io connection
let connectedUsers = 0;
const deviceCodes = new Map<string, string>(); // Maps 6-digit code to roomId

io.on('connection', (socket) => {
  connectedUsers++;
  io.emit('liveUsers', connectedUsers);

  // --- Proctoring & WebRTC Signaling ---
  
  // Join a specific room for an exam session
  socket.on('join-exam-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // Pairing code logic
  socket.on('register-device-code', ({ code, roomId }) => {
    deviceCodes.set(code, roomId);
  });

  socket.on('join-via-code', ({ code }) => {
    const roomId = deviceCodes.get(code);
    if (roomId) {
       socket.join(roomId);
       socket.emit('code-accepted', roomId);
    } else {
       socket.emit('code-rejected');
    }
  });

  // WebRTC Signaling
  socket.on('webrtc-offer', ({ roomId, offer, senderId, isSecondary }) => {
    socket.to(roomId).emit('webrtc-offer', { offer, senderId, isSecondary });
  });

  socket.on('webrtc-answer', ({ roomId, answer, senderId, isSecondary }) => {
    socket.to(roomId).emit('webrtc-answer', { answer, senderId, isSecondary });
  });

  socket.on('webrtc-ice-candidate', ({ roomId, candidate, senderId, isSecondary }) => {
    socket.to(roomId).emit('webrtc-ice-candidate', { candidate, senderId, isSecondary });
  });

  // Proctoring Events
  socket.on('proctor-event', (data) => {
    // data: { roomId, studentId, studentName, eventType, timestamp, details }
    // Broadcast to the proctors watching the room
    socket.to(data.roomId).emit('proctor-event-received', data);
  });
  
  socket.on('disconnect', () => {
    connectedUsers--;
    io.emit('liveUsers', connectedUsers);
  });
});

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/polling-platform';

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${PORT} (0.0.0.0)`);
  startKeepAlive();
});


mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.warn('⚠️ Please ensure MONGODB_URI is configured correctly in Render Dashboard environment variables.');
  });


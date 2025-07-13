import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { sequelize } from './sequelize';
import { initKafkaConsumer } from './kafka/consumer';
import dotenv from 'dotenv';

dotenv.config(); // Load env variables early

// Setup
const app = express();
const server = http.createServer(app);

// Socket.IO setup with proper CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket handlers
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (userId: string) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room.`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Initialize database and Kafka
const startServer = async () => {
  try {
    await sequelize.sync();
    console.log('✅ Database synced.');

    await initKafkaConsumer(io);
    console.log('✅ Kafka consumer initialized.');

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1); // Fail fast
  }
};

startServer();

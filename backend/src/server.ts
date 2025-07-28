import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import friendRoutes from './routes/friends';
import adminRoutes from './routes/admin';

import { producer } from './kafka/producer';
import { startKafkaConsumer } from './kafka/consumer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 Rate limit config (auth routes only)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per IP
  message: 'Too many requests from this IP, please try again later.',
});

// 🧩 Global middleware
app.use(cors());
app.use(express.json());

// 🛣️ Route definitions
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/admin', adminRoutes);

// ❤️ Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// 🚀 Start Kafka + server
const startServer = async () => {
  try {
    await producer.connect();
    console.log('✅ Connected to Kafka producer');

    await startKafkaConsumer();
    console.log('✅ Kafka consumer started');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

import express from 'express';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mount the routes — this is key
app.use('/api/auth', authRoutes);  // This exposes /api/auth/signup
app.use('/api/posts', postRoutes); // Optional: for /api/posts

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

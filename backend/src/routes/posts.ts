// routes/post.ts
import express from 'express';
import { createPost } from '../handler/createPost';
import { getUserPosts } from '../handler/getPost';


const router = express.Router();

router.post('/', createPost); // POST /posts
router.get('/:userId', getUserPosts); // GET /posts/:userId


export default router;

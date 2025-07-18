import express from 'express';
import { authenticate } from '../middleware/auth';
import { createPost } from '../handler/posts/createPost';
import { getUserPosts } from '../handler/posts/getUserPost';
import { likePost } from '../handler/posts/likePost';
import { createComment } from '../handler/posts/createComment';

const router = express.Router();

router.post('/', authenticate, createPost); // POST /posts
router.get('/:userId', authenticate, getUserPosts); // GET /posts/:userId
router.post('/:postId/like', authenticate, likePost); // POST /posts/:postId/like
router.post('/:postId/comment', authenticate, createComment); // POST /posts/:postId/comment

export default router;

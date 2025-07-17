// routes/post.ts
import express from 'express';
import { createPost } from '../handler/createPost';
import { getUserPosts } from '../handler/getPost';
import { likePost } from '../handler/likePost';
import { createComment } from '../handler/createComment';

const router = express.Router();

router.post('/', createPost); // POST /posts
router.get('/:userId', getUserPosts); // GET /posts/:userId
router.post('/:postId/like', likePost); // POST /posts/:postId/like
router.post('/:postId/comment', createComment); // POST /posts/:postId/comment

export default router;

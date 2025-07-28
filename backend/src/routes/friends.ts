import express from 'express';
import { authenticate } from '../middleware/auth';
import { sendFriendRequest } from '../handler/friends/sendFriendRequest';
import { respondToFriendRequest } from '../handler/friends/respondFriendRequest';

const router = express.Router();

router.post('/request', sendFriendRequest);
router.post('/respond', respondToFriendRequest);

export default router;
import express from 'express';
import { authenticate } from '../middleware/auth';
import { requestFriend } from '../handler/friends/requestFriend';
import { acceptFriend } from '../handler/friends/acceptFriend';
import { declineFriend } from '../handler/friends/declineFriend';
import { getFriends } from '../handler/friends/getFriends';
import { getPendingRequests } from '../handler/friends/getPendingRequests';

const router = express.Router();

router.post('/request', authenticate, requestFriend);
router.post('/accept', authenticate, acceptFriend);
router.post('/decline', authenticate, declineFriend);
router.get('/', authenticate, getFriends);
router.get('/pending', authenticate, getPendingRequests);

export default router;
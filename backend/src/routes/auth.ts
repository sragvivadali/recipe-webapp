import express from 'express';
import { handleSignup } from '../handler/auth/handleSignup';
import { handleLogin } from '../handler/auth/handleLogin';

const router = express.Router();

router.post('/signup', handleSignup);
router.post('/login', handleLogin);

export default router;

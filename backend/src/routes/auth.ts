// routes/auth.ts
import express from 'express';
import { handleSignup } from '../handler/handleSignup';
import { handleLogin } from '../handler/handleLogin';

const router = express.Router();

router.post('/signup', handleSignup);
router.post('/login', handleLogin);

export default router;

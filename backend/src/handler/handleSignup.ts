import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma';
import { publishEvent } from '../kafka/producer';

const prisma = new PrismaClient();

export const handleSignup = async (req: Request, res: Response) => {
  const { username, email: rawEmail, password } = req.body;
  const email = rawEmail.toLowerCase().trim();

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await publishEvent('user-events', {
      type: 'signup',
      user: {
        username,
        email,
        password_hash: passwordHash,
      }
    });

    return res.status(202).json({
      message: 'Signup request received',
      username,
      email,
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

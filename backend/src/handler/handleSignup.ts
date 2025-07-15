import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma';

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

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password_hash: passwordHash,
      },
    });

    const token = jwt.sign(
      { id: newUser.user_id, username: newUser.username, email: newUser.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      id: newUser.user_id,
      username: newUser.username,
      email: newUser.email,
      token,
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

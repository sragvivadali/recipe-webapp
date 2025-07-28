import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../../generated/prisma';

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
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          email,
          password_hash: passwordHash,
        },
      });

      await tx.outbox.create({
        data: {
          event_type: 'user-created',
          payload: {
            type: 'signup',
            user: {
              user_id: user.user_id,
              username: user.username,
              email: user.email,
              created_at: user.created_at,
            },
          },
        },
      });

      return user;
    });

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        user_id: result.user_id,
        username: result.username,
        email: result.email,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

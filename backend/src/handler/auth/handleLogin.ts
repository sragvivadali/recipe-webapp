import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export const handleLogin = async (req: Request, res: Response) => {
  const { identifier, password } = req.body; // identifier = email or username

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Missing identifier or password' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier.toLowerCase().trim() }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user.user_id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    // ✅ Explicitly return user_id so Postman can save it
    return res.status(200).json({
      token,
      id: user.user_id,
      username: user.username,
      email: user.email
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

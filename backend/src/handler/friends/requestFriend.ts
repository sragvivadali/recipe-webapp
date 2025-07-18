// handler/friends/requestFriend.ts
import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export const requestFriend = async (req: Request, res: Response) => {
  const userId = req.params.userId; // assuming auth middleware adds `userId` to req.user
  const { toUserId } = req.body;

  if (!userId || !toUserId) {
    return res.status(400).json({ error: 'Missing userId or toUserId' });
  }

  try {
    const request = await prisma.friendRequest.create({
      data: {
        sender_id: userId,
        receiver_id: toUserId,
        status: 'pending',
      },
    });

    res.status(201).json(request);
  } catch (err) {
    console.error('Friend request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

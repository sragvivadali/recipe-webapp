// handler/friends/acceptFriend.ts
import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export const acceptFriend = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const { requestId } = req.body;

  if (!userId || !requestId) {
    return res.status(400).json({ error: 'Missing userId or requestId' });
  }

  try {
    const result = await prisma.friendRequest.updateMany({
      where: { id: requestId, receiver_id: userId, status: 'pending' },
      data: { status: 'accepted' },
    });

    res.json({ success: result.count > 0 });
  } catch (err) {
    console.error('Accept friend request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

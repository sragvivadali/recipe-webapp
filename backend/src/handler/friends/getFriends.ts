import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export const getFriends = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const friends = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { sender_id: userId, status: 'accepted' },
          { receiver_id: userId, status: 'accepted' },
        ],
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    res.json(friends);
  } catch (err) {
    console.error('Get friends error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
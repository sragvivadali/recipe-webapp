import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export const getPendingRequests = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const pending = await prisma.friendRequest.findMany({
      where: { receiver_id: userId, status: 'pending' },
      include: {
        sender: true,
      },
    });

    res.json(pending);
  } catch (err) {
    console.error('Get pending requests error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

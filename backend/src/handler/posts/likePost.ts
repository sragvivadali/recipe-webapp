import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { publishEvent } from '../../kafka/producer';

const prisma = new PrismaClient();

export const likePost = async (req: Request, res: Response) => {
  const { userId, postId } = req.body;

  if (!userId || !postId) {
    return res.status(400).json({ error: 'Missing userId or postId' });
  }

  try {
    const like = await prisma.like.create({
      data: { user_id: userId, post_id: postId },
    });

    await publishEvent('like-events', {
      type: 'NEW_LIKE',
      data: like,
    });

    return res.status(201).json(like);
  } catch (err) {
    console.error('Error liking post:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { publishEvent } from '../kafka/producer';

const prisma = new PrismaClient();

export const createComment = async (req: Request, res: Response) => {
  const { userId, postId, content } = req.body;

  if (!userId || !postId || !content) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const comment = await prisma.comment.create({
      data: { user_id: userId, post_id: postId, content },
    });

    // Send event to Kafka
    await publishEvent('comment-events', {
      type: 'NEW_COMMENT',
      data: comment,
    });

    return res.status(201).json(comment);
  } catch (err) {
    console.error('Error creating comment:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

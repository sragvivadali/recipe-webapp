import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { producer } from '../../kafka/producer';
import { publishEvent } from '../../kafka/producer';
const prisma = new PrismaClient();

export const createComment = async (req: Request, res: Response) => {
    const { userId, content } = req.body;
    const { postId } = req.params; 
  
    if (!userId || !postId || !content) {
      return res.status(400).json({ error: 'Missing fields' });
    }
  
    try {
      const comment = await prisma.comment.create({
        data: { content, user_id: userId, post_id: postId },
      });
  
      await producer.send({
        topic: 'post-comments',
        messages: [
          {
            value: JSON.stringify({
              type: 'comment_created',
              timestamp: new Date(),
              data: comment,
            }),
          },
        ],
      });

      await publishEvent('notification-events', {
        type: 'comment', // or 'like'
        postId,
        fromUserId: userId, // the user who commented/liked
        // userId: postOwnerId, // the user to notify
      });
  
      res.status(201).json(comment);
    } catch (err) {
      console.error('Create comment error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
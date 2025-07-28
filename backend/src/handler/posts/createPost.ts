import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { createOutboxEvent, outboxEvents } from '../../utils/outbox';

const prisma = new PrismaClient();

export const createPost = async (req: Request, res: Response) => {
  const {
    userId,
    recipeName,
    prepTimeMin,
    difficulty,
    instructions,
    cuisine,
    imageUrl,
  } = req.body;

  if (!userId || !recipeName) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          user_id: userId,
          recipe_name: recipeName,
          prep_time_min: prepTimeMin,
          difficulty,
          instructions,
          cuisine,
          image_url: imageUrl,
        },
      });

      await createOutboxEvent(tx, outboxEvents.postCreated(post));

      return post;
    });

    return res.status(201).json({ message: 'Post created', post: result });
  } catch (err) {
    console.error('Post creation error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

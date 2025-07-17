import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { producer } from '../kafka/producer';

const prisma = new PrismaClient();

export const createPost = async (req: Request, res: Response) => {
  const {
    userId,
    recipeName,
    prepTimeMin,
    difficulty,
    instructions,
    cuisine,
  } = req.body;

  if (!userId || !recipeName || !prepTimeMin || !difficulty || !instructions || !cuisine) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const post = await prisma.post.create({
      data: {
        user_id: userId,
        recipe_name: recipeName,
        prep_time_min: prepTimeMin,
        difficulty,
        instructions,
        cuisine,
      },
    });

    // Produce Kafka event
    await producer.send({
      topic: 'post-created',
      messages: [
        {
          key: post.post_id,
          value: JSON.stringify({
            post_id: post.post_id,
            user_id: post.user_id,
            recipeName: post.recipe_name,
            cuisine: post.cuisine,
            created_at: post.created_at,
          }),
        },
      ],
    });

    return res.status(201).json({ message: 'Post created', post });
  } catch (err) {
    console.error('Post creation error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

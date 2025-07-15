import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

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
        userId,
        recipe_name: recipeName,
        prep_time_min: prepTimeMin,
        difficulty,
        instructions,
        cuisine,
      },
    });

    return res.status(201).json({ message: 'Post created', post });
  } catch (err) {
    console.error('Post creation error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

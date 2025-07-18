import { Kafka } from 'kafkajs';
import { PrismaClient } from './../../generated/prisma';
import { producer } from '../producer';

const prisma = new PrismaClient();

export async function startPostConsumer(kafka: Kafka) {
  const consumer = kafka.consumer({ groupId: 'post-service' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'post-events', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const value = message.value?.toString();
      if (!value) return;
      const event = JSON.parse(value);
      console.log('[Kafka][post-events]', event);

      if (event.type === 'create_post') {
        await prisma.post.create({ data: event.post });
      }

      if (event.type === 'like_post') {
        await prisma.like.create({ data: event.like });
      }

      if (event.type === 'comment') {
        const comment = await prisma.comment.create({ data: event.comment });

        // Get post owner
        const post = await prisma.post.findUnique({
          where: { post_id: comment.post_id },
        });
        if (!post) return;

        const postOwnerId = post.user_id;

        // Check if the commenter is a friend
        const isFriend = await prisma.follow.findFirst({
          where: {
            follower_id: postOwnerId,
            followed_id: comment.user_id,
          },
        });

        const followedBack = await prisma.follow.findFirst({
          where: {
            follower_id: comment.user_id,
            followed_id: postOwnerId,
          },
        });

        if (isFriend && followedBack) {
          // Removed notification creation block since Notification model is deleted
        }
      }
    },
  });
}

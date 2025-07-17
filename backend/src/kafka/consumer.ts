import { Kafka } from 'kafkajs';
import { PrismaClient } from '@prisma/client';

const kafka = new Kafka({
  clientId: 'recipe-consumer',
  brokers: ['localhost:9092'],
});

// Separate consumers for different event types
const userConsumer = kafka.consumer({ groupId: 'user-service' });
const postConsumer = kafka.consumer({ groupId: 'post-service' });
const notificationConsumer = kafka.consumer({ groupId: 'notification-service' });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Add connection pooling
});

export async function startKafkaConsumer() {
  await  userConsumer.connect();
  await postConsumer.connect();
  await notificationConsumer.connect();

  await userConsumer.subscribe({ topic: 'user-events', fromBeginning: true });
  await postConsumer.subscribe({ topic: 'post-events', fromBeginning: true });
  await notificationConsumer.subscribe({ topic: 'notification-events', fromBeginning: true });

  await userConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = message.value?.toString();
      if (value) {
        const event = JSON.parse(value);
        console.log(`[Kafka][${topic}]`, event);

        if (event.type === 'signup') {
          // Write user to database
          await prisma.user.create({
            data: event.user,
          });
        }

        if (event.type === 'friend_request') {
          // Handle friend request
          await prisma.friendRequest.create({
            data: event.data,
          });
        }
      }
    },
  });

  await postConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = message.value?.toString();
      if (value) {
        const event = JSON.parse(value);
        console.log(`[Kafka][${topic}]`, event);

        if (event.type === 'create_post') {
          await prisma.post.create({
            data: event.post,
          });
        }

        if (event.type === 'like_post') {
          await prisma.like.create({
            data: event.like,
          });
        }

        if (event.type === 'comment') {
          await prisma.comment.create({
            data: event.comment,
          });
        }
      }
    },
  });

  await notificationConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = message.value?.toString();
      if (value) {
        const event = JSON.parse(value);
        console.log(`[Kafka][${topic}]`, event);

        if (event.type === 'notification') {
          await prisma.notification.create({
            data: event.notification,
          });
        }
      }
    },
  });
}

import { Kafka } from 'kafkajs';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export async function startUserConsumer(kafka: Kafka) {
  const consumer = kafka.consumer({ groupId: 'user-service' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'user-events', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const value = message.value?.toString();
      if (!value) return;
      const event = JSON.parse(value);
      console.log('[Kafka][user-events]', event);

      if (event.type === 'signup') {
        await prisma.user.create({ data: event.user });
      }

      if (event.type === 'friend_request') {
        await prisma.friendRequest.create({ data: event.data });
      }
    },
  });
}

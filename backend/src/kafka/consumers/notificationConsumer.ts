import { Kafka } from 'kafkajs';
import { PrismaClient } from './../../generated/prisma';

const prisma = new PrismaClient();

export async function startNotificationConsumer(kafka: Kafka) {
  const consumer = kafka.consumer({ groupId: 'notification-service' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'notification-events', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const value = message.value?.toString();
      if (!value) return;
      const event = JSON.parse(value);
      console.log('[Kafka][notification-events]', event);

      if (event.type === 'notification') {
        await prisma.notification.create({
          data: event.notification,
        });
      }
    },
  });
}

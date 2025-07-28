import { Kafka } from 'kafkajs';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export async function startFriendsConsumer(kafka: Kafka) {
  const consumer = kafka.consumer({ groupId: 'friends-service' });

  await consumer.connect();
  await consumer.subscribe({ topic: 'friends-events', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = message.value?.toString();
      if (!value) return;

      try {
        const event = JSON.parse(value);
        console.log('[Kafka][friends-events]', event);

        switch (event.type) {
          case 'friend_request':
            if (event.data?.sender_id && event.data?.receiver_id) {
              await prisma.friendRequest.create({
                data: {
                  sender_id: event.data.sender_id,
                  receiver_id: event.data.receiver_id,
                  status: event.data.status || 'pending',
                },
              });
            } else {
              console.warn('Missing fields in friend_request event:', event);
            }
            break;

          case 'friend_request_response':
            const { sender_id, receiver_id, action } = event.data || {};

            if (!sender_id || !receiver_id || !action) {
              console.warn('Missing fields in friend_request_response:', event);
              break;
            }

            if (action === 'accepted') {
              // Mark request as accepted
              await prisma.friendRequest.updateMany({
                where: { sender_id, receiver_id },
                data: { status: 'accepted' },
              });

              // Add both directions as friends (optional: only one if unidirectional)
              await prisma.friend.createMany({
                data: [
                  { user_id: sender_id, friend_id: receiver_id },
                  { user_id: receiver_id, friend_id: sender_id },
                ],
                skipDuplicates: true,
              });

              console.log(`Friendship created between ${sender_id} and ${receiver_id}`);
            } else if (action === 'declined') {
              // Remove request from DB
              await prisma.friendRequest.deleteMany({
                where: { sender_id, receiver_id },
              });

              console.log(`Friend request from ${sender_id} to ${receiver_id} declined and deleted`);
            } else {
              console.warn('Unknown action in friend_request_response:', action);
            }
            break;

          default:
            console.warn('Unknown event type:', event.type);
        }
      } catch (err) {
        console.error('Error processing Kafka message:', err);
      }
    },
  });
}

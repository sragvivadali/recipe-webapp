import { Kafka } from 'kafkajs';
import { startUserConsumer } from './consumers/userConsumer';
import { startPostConsumer } from './consumers/postConsumer';
import { startNotificationConsumer } from './consumers/notificationConsumer';

const kafka = new Kafka({
  clientId: 'recipe-app',
  brokers: ['localhost:9092'],
});

export async function startKafkaConsumer() {
  await startUserConsumer(kafka);
  await startPostConsumer(kafka);
  await startNotificationConsumer(kafka);
}

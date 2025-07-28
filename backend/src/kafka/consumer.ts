import { Kafka } from 'kafkajs';
import { startUserConsumer } from './consumers/userConsumer';
import { startPostConsumer } from './consumers/postConsumer';
import { startFriendsConsumer } from './consumers/friendsConsumer';

const kafka = new Kafka({
  clientId: 'recipe-app',
  brokers: ['localhost:9092'],
});

export async function startKafkaConsumer() {
  await startUserConsumer(kafka);
  await startFriendsConsumer(kafka);
  await startPostConsumer(kafka);
}

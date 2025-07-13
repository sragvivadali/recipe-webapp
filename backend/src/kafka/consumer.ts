import { Kafka } from 'kafkajs';
import { Server } from 'socket.io';
import { Recipe } from '../models/Recipe';
import { getFriends } from '../utils/getFriends';

export function initKafkaConsumer(io: Server) {
  const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER!] });
  const consumer = kafka.consumer({ groupId: 'recipe-group' });

  (async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC!, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ message }) => {
        const data = JSON.parse(message.value!.toString());
        const recipe = await Recipe.create(data);
        const friends = await getFriends(data.chef);

        friends.forEach(fid => io.to(fid).emit('new-recipe', recipe));
      }
    });
  })();
}
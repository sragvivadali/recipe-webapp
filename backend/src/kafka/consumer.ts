import { Server } from 'socket.io';
import { getFriends } from '../utils/getFriends';
import { Recipe } from '../models/Recipe';

// In-memory recipe store
const recipes: Recipe[] = [];

export function initKafkaConsumer(io: Server) {
  const { Kafka } = require('kafkajs');
  const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER!] });
  const consumer = kafka.consumer({ groupId: 'recipe-group' });

  (async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC!, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ message }: { message: { value: Buffer | null } }) => {
        const data = JSON.parse(message.value!.toString());
        const recipe: Recipe = { ...data, createdAt: new Date() };
        recipes.push(recipe);
        const friends = await getFriends(data.chef);
        friends.forEach(fid => io.to(fid).emit('new-recipe', recipe));
      }
    });
  })();
}

// Export recipes for use in endpoints
export { recipes };
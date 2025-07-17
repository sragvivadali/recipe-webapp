import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'recipe-app',
  brokers: ['localhost:9092'], // or your docker IP
});

export const producer = kafka.producer();

export async function publishEvent(topic: string, payload: object) {
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(payload) }],
  });
}

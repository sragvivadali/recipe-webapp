"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startUserConsumer = startUserConsumer;
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
async function startUserConsumer(kafka) {
    const consumer = kafka.consumer({ groupId: 'user-service' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'user-events', fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ message }) => {
            const value = message.value?.toString();
            if (!value)
                return;
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

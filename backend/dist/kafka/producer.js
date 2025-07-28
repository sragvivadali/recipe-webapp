"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.producer = void 0;
exports.publishEvent = publishEvent;
const kafkajs_1 = require("kafkajs");
const kafka = new kafkajs_1.Kafka({
    clientId: 'recipe-app',
    brokers: ['localhost:9092'],
});
exports.producer = kafka.producer();
async function publishEvent(topic, payload) {
    await exports.producer.connect();
    await exports.producer.send({
        topic,
        messages: [{ value: JSON.stringify(payload) }],
    });
}

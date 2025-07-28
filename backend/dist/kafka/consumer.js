"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startKafkaConsumer = startKafkaConsumer;
const kafkajs_1 = require("kafkajs");
const userConsumer_1 = require("./consumers/userConsumer");
const postConsumer_1 = require("./consumers/postConsumer");
const friendsConsumer_1 = require("./consumers/friendsConsumer");
const kafka = new kafkajs_1.Kafka({
    clientId: 'recipe-app',
    brokers: ['localhost:9092'],
});
async function startKafkaConsumer() {
    await (0, userConsumer_1.startUserConsumer)(kafka);
    await (0, friendsConsumer_1.startFriendsConsumer)(kafka);
    await (0, postConsumer_1.startPostConsumer)(kafka);
}

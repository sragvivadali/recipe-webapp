"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFriendRequest = sendFriendRequest;
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
async function sendFriendRequest(req, res) {
    const { sender_id, receiver_id } = req.body;
    if (!sender_id || !receiver_id) {
        return res.status(400).json({ error: 'sender_id and receiver_id are required' });
    }
    if (sender_id === receiver_id) {
        return res.status(400).json({ error: 'Cannot send request to yourself' });
    }
    const sender = await prisma.user.findUnique({ where: { user_id: sender_id } });
    const receiver = await prisma.user.findUnique({ where: { user_id: receiver_id } });
    if (!sender || !receiver) {
        return res.status(404).json({ error: 'Invalid sender or receiver' });
    }
    const isBlocked = await prisma.block.findFirst({
        where: {
            OR: [
                { blocker_id: receiver_id, blocked_id: sender_id },
                { blocker_id: sender_id, blocked_id: receiver_id },
            ],
        },
    });
    if (isBlocked) {
        return res.status(403).json({ error: 'Cannot send request' });
    }
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Create friend request in DB
            const friendRequest = await tx.friendRequest.create({
                data: {
                    sender_id,
                    receiver_id,
                    status: 'pending',
                },
            });
            // Create outbox event
            await tx.outbox.create({
                data: {
                    event_type: 'friend-request-sent',
                    payload: {
                        type: 'friend_request_sent',
                        timestamp: new Date(),
                        data: friendRequest,
                    },
                },
            });
            return friendRequest;
        });
        return res.status(201).json({ message: 'Friend request sent' });
    }
    catch (err) {
        console.error('sendFriendRequest error:', err);
        return res.status(409).json({ error: 'Request already exists or failed' });
    }
}

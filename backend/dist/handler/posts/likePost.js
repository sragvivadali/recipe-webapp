"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePost = void 0;
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
const likePost = async (req, res) => {
    const { userId, postId } = req.body;
    if (!userId || !postId) {
        return res.status(400).json({ error: 'Missing userId or postId' });
    }
    try {
        const result = await prisma.$transaction(async (tx) => {
            const like = await tx.like.create({
                data: { user_id: userId, post_id: postId },
            });
            await tx.outbox.create({
                data: {
                    event_type: 'like-created',
                    payload: {
                        type: 'NEW_LIKE',
                        data: like,
                    },
                },
            });
            return like;
        });
        return res.status(201).json(result);
    }
    catch (err) {
        console.error('Error liking post:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.likePost = likePost;

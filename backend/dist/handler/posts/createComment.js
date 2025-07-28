"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComment = void 0;
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
const createComment = async (req, res) => {
    const { userId, content } = req.body;
    const { postId } = req.params;
    if (!userId || !postId || !content) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    try {
        const result = await prisma.$transaction(async (tx) => {
            const comment = await tx.comment.create({
                data: { content, user_id: userId, post_id: postId },
            });
            await tx.outbox.create({
                data: {
                    event_type: 'comment-created',
                    payload: {
                        type: 'comment_created',
                        timestamp: new Date(),
                        data: comment,
                    },
                },
            });
            return comment;
        });
        res.status(201).json(result);
    }
    catch (err) {
        console.error('Create comment error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.createComment = createComment;

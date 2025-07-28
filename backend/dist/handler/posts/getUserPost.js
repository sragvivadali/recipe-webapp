"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPosts = void 0;
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
const getUserPosts = async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId in URL params' });
    }
    try {
        const posts = await prisma.post.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }, // Optional: newest first
        });
        return res.status(200).json({ posts });
    }
    catch (err) {
        console.error('Error fetching user posts:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.getUserPosts = getUserPosts;

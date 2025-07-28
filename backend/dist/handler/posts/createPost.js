"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = void 0;
const prisma_1 = require("../../generated/prisma");
const outbox_1 = require("../../utils/outbox");
const prisma = new prisma_1.PrismaClient();
const createPost = async (req, res) => {
    const { userId, recipeName, prepTimeMin, difficulty, instructions, cuisine, imageUrl, } = req.body;
    if (!userId || !recipeName) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    try {
        const result = await prisma.$transaction(async (tx) => {
            const post = await tx.post.create({
                data: {
                    user_id: userId,
                    recipe_name: recipeName,
                    prep_time_min: prepTimeMin,
                    difficulty,
                    instructions,
                    cuisine,
                    image_url: imageUrl,
                },
            });
            await (0, outbox_1.createOutboxEvent)(tx, outbox_1.outboxEvents.postCreated(post));
            return post;
        });
        return res.status(201).json({ message: 'Post created', post: result });
    }
    catch (err) {
        console.error('Post creation error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.createPost = createPost;

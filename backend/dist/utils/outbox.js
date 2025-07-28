"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outboxEvents = void 0;
exports.createOutboxEvent = createOutboxEvent;
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
/**
 * Creates an outbox event within a transaction
 * @param tx - Prisma transaction
 * @param event - The event to create
 */
async function createOutboxEvent(tx, event) {
    return await tx.outbox.create({
        data: {
            event_type: event.event_type,
            payload: event.payload,
        },
    });
}
/**
 * Helper function to create common outbox events
 */
exports.outboxEvents = {
    postCreated: (post) => ({
        event_type: 'post-created',
        payload: {
            post_id: post.post_id,
            user_id: post.user_id,
            recipeName: post.recipe_name,
            cuisine: post.cuisine,
            created_at: post.created_at,
            image_url: post.image_url,
        },
    }),
    commentCreated: (comment) => ({
        event_type: 'comment-created',
        payload: {
            type: 'comment_created',
            timestamp: new Date(),
            data: comment,
        },
    }),
    likeCreated: (like) => ({
        event_type: 'like-created',
        payload: {
            type: 'NEW_LIKE',
            data: like,
        },
    }),
    userCreated: (user) => ({
        event_type: 'user-created',
        payload: {
            type: 'signup',
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                created_at: user.created_at,
            },
        },
    }),
    friendRequestSent: (friendRequest) => ({
        event_type: 'friend-request-sent',
        payload: {
            type: 'friend_request_sent',
            timestamp: new Date(),
            data: friendRequest,
        },
    }),
    friendRequestAccepted: (friendRequest) => ({
        event_type: 'friend-request-accepted',
        payload: {
            type: 'friend_request_accepted',
            timestamp: new Date(),
            data: friendRequest,
        },
    }),
    friendRequestRejected: (requestId, senderId, receiverId) => ({
        event_type: 'friend-request-rejected',
        payload: {
            type: 'friend_request_rejected',
            timestamp: new Date(),
            data: {
                requestId,
                sender_id: senderId,
                receiver_id: receiverId,
            },
        },
    }),
};

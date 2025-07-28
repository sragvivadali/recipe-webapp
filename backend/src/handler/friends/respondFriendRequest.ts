import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export async function respondToFriendRequest(req: Request, res: Response) {
  const { requestId, action } = req.body;

  if (!requestId || !['accept', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Invalid requestId or action' });
  }

  try {
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(409).json({ error: 'Request already handled' });
    }

    if (action === 'accept') {
      const result = await prisma.$transaction(async (tx) => {
        const updatedRequest = await tx.friendRequest.update({
          where: { id: requestId },
          data: { status: 'accepted' },
        });

        await tx.friend.createMany({
          data: [
            { user_id: friendRequest.sender_id, friend_id: friendRequest.receiver_id },
            { user_id: friendRequest.receiver_id, friend_id: friendRequest.sender_id },
          ],
          skipDuplicates: true,
        });

        // Create outbox event for acceptance
        await tx.outbox.create({
          data: {
            event_type: 'friend-request-accepted',
            payload: {
              type: 'friend_request_accepted',
              timestamp: new Date(),
              data: updatedRequest,
            },
          },
        });

        return updatedRequest;
      });

      return res.json({ message: 'Friend request accepted' });
    } else {
      const result = await prisma.$transaction(async (tx) => {
        await tx.friendRequest.delete({ where: { id: requestId } });

        // Create outbox event for rejection
        await tx.outbox.create({
          data: {
            event_type: 'friend-request-rejected',
            payload: {
              type: 'friend_request_rejected',
              timestamp: new Date(),
              data: {
                requestId,
                sender_id: friendRequest.sender_id,
                receiver_id: friendRequest.receiver_id,
              },
            },
          },
        });

        return { deleted: true };
      });

      return res.json({ message: 'Friend request rejected and deleted' });
    }
  } catch (err) {
    console.error('respondToFriendRequest error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

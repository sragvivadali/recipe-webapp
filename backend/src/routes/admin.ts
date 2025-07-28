import { Router } from 'express';
import { getOutboxStats, retryFailedEvents, cleanupOldSentEvents } from '../utils/outboxMonitor';

const router = Router();

// Get outbox status
router.get('/outbox/status', async (req, res) => {
  try {
    const stats = await getOutboxStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting outbox status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get outbox status'
    });
  }
});

// Retry failed events
router.post('/outbox/retry', async (req, res) => {
  try {
    const retriedCount = await retryFailedEvents();
    res.json({
      success: true,
      data: {
        retriedCount,
        message: `Retried ${retriedCount} failed events`
      }
    });
  } catch (error) {
    console.error('Error retrying failed events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retry events'
    });
  }
});

// Cleanup old events
router.post('/outbox/cleanup', async (req, res) => {
  try {
    const cleanedCount = await cleanupOldSentEvents();
    res.json({
      success: true,
      data: {
        cleanedCount,
        message: `Cleaned up ${cleanedCount} old events`
      }
    });
  } catch (error) {
    console.error('Error cleaning up old events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup events'
    });
  }
});

export default router; 
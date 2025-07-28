import { prisma } from './prisma';

export interface OutboxStats {
  pending: number;
  sent: number;
  failed: number;
  total: number;
}

export interface OutboxEventSummary {
  event_type: string;
  count: number;
  status: string;
}

/**
 * Get outbox statistics
 */
export async function getOutboxStats(): Promise<OutboxStats> {
  const [pending, sent, failed, total] = await Promise.all([
    prisma.outbox.count({ where: { status: 'pending' } }),
    prisma.outbox.count({ where: { status: 'sent' } }),
    prisma.outbox.count({ where: { status: 'failed' } }),
    prisma.outbox.count(),
  ]);

  return { pending, sent, failed, total };
}

/**
 * Get events by type and status
 */
export async function getOutboxEventsByType(): Promise<OutboxEventSummary[]> {
  const events = await prisma.outbox.groupBy({
    by: ['event_type', 'status'],
    _count: {
      id: true,
    },
  });

  return events.map(event => ({
    event_type: event.event_type,
    count: event._count.id,
    status: event.status,
  }));
}

/**
 * Get recent failed events
 */
export async function getRecentFailedEvents(limit: number = 10) {
  return await prisma.outbox.findMany({
    where: { status: 'failed' },
    orderBy: { created_at: 'desc' },
    take: limit,
  });
}

/**
 * Retry failed events
 */
export async function retryFailedEvents() {
  const failedEvents = await prisma.outbox.findMany({
    where: { status: 'failed' },
  });

  console.log(`Retrying ${failedEvents.length} failed events...`);

  for (const event of failedEvents) {
    await prisma.outbox.update({
      where: { id: event.id },
      data: { status: 'pending' },
    });
  }

  return failedEvents.length;
}

/**
 * Clean up old sent events (older than 7 days)
 */
export async function cleanupOldSentEvents() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const result = await prisma.outbox.deleteMany({
    where: {
      status: 'sent',
      sent_at: {
        lt: sevenDaysAgo,
      },
    },
  });

  console.log(`Cleaned up ${result.count} old sent events`);
  return result.count;
}

/**
 * Print outbox status to console
 */
export async function printOutboxStatus() {
  const stats = await getOutboxStats();
  const eventsByType = await getOutboxEventsByType();

  console.log('\n📊 Outbox Status:');
  console.log('================');
  console.log(`Total Events: ${stats.total}`);
  console.log(`Pending: ${stats.pending}`);
  console.log(`Sent: ${stats.sent}`);
  console.log(`Failed: ${stats.failed}`);

  if (eventsByType.length > 0) {
    console.log('\nEvents by Type:');
    eventsByType.forEach(event => {
      console.log(`  ${event.event_type} (${event.status}): ${event.count}`);
    });
  }

  if (stats.failed > 0) {
    const recentFailed = await getRecentFailedEvents(3);
    console.log('\nRecent Failed Events:');
    recentFailed.forEach(event => {
      console.log(`  ${event.event_type}: ${event.id} (${event.created_at})`);
    });
  }
}

// Run if called directly
if (require.main === module) {
  printOutboxStatus()
    .then(() => process.exit(0))
    .catch(console.error);
} 
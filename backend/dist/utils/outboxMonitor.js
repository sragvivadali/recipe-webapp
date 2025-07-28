"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutboxStats = getOutboxStats;
exports.getOutboxEventsByType = getOutboxEventsByType;
exports.getRecentFailedEvents = getRecentFailedEvents;
exports.retryFailedEvents = retryFailedEvents;
exports.cleanupOldSentEvents = cleanupOldSentEvents;
exports.printOutboxStatus = printOutboxStatus;
const prisma_1 = require("./prisma");
/**
 * Get outbox statistics
 */
async function getOutboxStats() {
    const [pending, sent, failed, total] = await Promise.all([
        prisma_1.prisma.outbox.count({ where: { status: 'pending' } }),
        prisma_1.prisma.outbox.count({ where: { status: 'sent' } }),
        prisma_1.prisma.outbox.count({ where: { status: 'failed' } }),
        prisma_1.prisma.outbox.count(),
    ]);
    return { pending, sent, failed, total };
}
/**
 * Get events by type and status
 */
async function getOutboxEventsByType() {
    const events = await prisma_1.prisma.outbox.groupBy({
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
async function getRecentFailedEvents(limit = 10) {
    return await prisma_1.prisma.outbox.findMany({
        where: { status: 'failed' },
        orderBy: { created_at: 'desc' },
        take: limit,
    });
}
/**
 * Retry failed events
 */
async function retryFailedEvents() {
    const failedEvents = await prisma_1.prisma.outbox.findMany({
        where: { status: 'failed' },
    });
    console.log(`Retrying ${failedEvents.length} failed events...`);
    for (const event of failedEvents) {
        await prisma_1.prisma.outbox.update({
            where: { id: event.id },
            data: { status: 'pending' },
        });
    }
    return failedEvents.length;
}
/**
 * Clean up old sent events (older than 7 days)
 */
async function cleanupOldSentEvents() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const result = await prisma_1.prisma.outbox.deleteMany({
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
async function printOutboxStatus() {
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

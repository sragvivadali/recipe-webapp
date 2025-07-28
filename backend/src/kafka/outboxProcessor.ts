import { prisma } from '../utils/prisma';
import { producer } from './producer';

const OUTBOX_BATCH_SIZE = 10;
const PROCESSING_INTERVAL = 2000; // 2 seconds

let isShuttingDown = false;

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  isShuttingDown = true;
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  isShuttingDown = true;
});

async function processOutbox() {
  try {
    // Fetch a batch of pending outbox events
    const events = await prisma.outbox.findMany({
      where: { status: 'pending' },
      orderBy: { created_at: 'asc' },
      take: OUTBOX_BATCH_SIZE,
    });

    if (events.length > 0) {
      console.log(`Processing ${events.length} outbox events...`);
    }

    for (const event of events) {
      if (isShuttingDown) {
        console.log('Shutdown requested, stopping event processing...');
        break;
      }

      try {
        console.log(`Publishing event ${event.id} to topic: ${event.event_type}`);
        
        // Publish to Kafka
        await producer.send({
          topic: event.event_type,
          messages: [
            {
              key: event.id,
              value: JSON.stringify(event.payload),
            },
          ],
        });

        // Mark as sent
        await prisma.outbox.update({
          where: { id: event.id },
          data: { status: 'sent', sent_at: new Date() },
        });

        console.log(`Successfully processed event ${event.id}`);
      } catch (err) {
        console.error(`Failed to process outbox event ${event.id}:`, err);
        
        // Mark as failed
        await prisma.outbox.update({
          where: { id: event.id },
          data: { status: 'failed' },
        });
      }
    }
  } catch (error) {
    console.error('Error in outbox processing loop:', error);
  }
}

async function startOutboxProcessor() {
  console.log('Starting outbox processor...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Test Kafka connection
    await producer.connect();
    console.log('Kafka producer connected successfully');
    
    console.log(`Outbox processor started. Processing every ${PROCESSING_INTERVAL}ms`);
    
    while (!isShuttingDown) {
      await processOutbox();
      await new Promise((resolve) => setTimeout(resolve, PROCESSING_INTERVAL));
    }
  } catch (error) {
    console.error('Failed to start outbox processor:', error);
    process.exit(1);
  } finally {
    console.log('Shutting down outbox processor...');
    await prisma.$disconnect();
    await producer.disconnect();
    console.log('Outbox processor stopped');
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  startOutboxProcessor().catch((error) => {
    console.error('Unhandled error in outbox processor:', error);
    process.exit(1);
  });
}

export { startOutboxProcessor }; 
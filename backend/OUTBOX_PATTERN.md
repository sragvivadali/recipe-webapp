# Outbox Pattern Implementation

This document describes the outbox pattern implementation in the recipe app backend, which ensures fault-tolerant and atomic event publishing.

## 🎯 Overview

The outbox pattern guarantees that database writes and event publishing happen atomically, even in the face of failures or concurrent operations.

### Key Benefits:

- ✅ **Atomicity**: Database writes and event publishing happen together or not at all
- ✅ **Fault Tolerance**: Events are never lost, even if Kafka is down
- ✅ **Concurrency Safe**: Multiple writes/updates are handled safely
- ✅ **Retry Capability**: Failed events can be retried automatically

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Handler   │───▶│   Database      │───▶│   Outbox Table  │
│   (createPost)  │    │   Transaction   │    │   (pending)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Kafka Topics  │◀───│   Outbox        │◀───│   Outbox        │
│   (post-created)│    │   Processor     │    │   Table         │
└─────────────────┘    └─────────────────┘    │   (sent)        │
                                              └─────────────────┘
```

## 📊 Database Schema

```sql
CREATE TABLE outbox (
  id         VARCHAR PRIMARY KEY,
  event_type VARCHAR NOT NULL,
  payload    JSONB NOT NULL,
  status     VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at    TIMESTAMP NULL
);
```

## 🚀 Usage

### 1. Writing Data with Outbox Events

All handlers now use transactions to write both main data and outbox events:

```typescript
const result = await prisma.$transaction(async (tx) => {
  // 1. Write main data
  const post = await tx.post.create({
    data: {
      /* post data */
    },
  });

  // 2. Create outbox event
  await createOutboxEvent(tx, outboxEvents.postCreated(post));

  return post;
});
```

### 2. Available Event Types

The following event types are supported:

- `post-created` - When a new post is created
- `comment-created` - When a comment is added
- `like-created` - When a post is liked
- `user-created` - When a user signs up
- `friend-request-sent` - When a friend request is sent
- `friend-request-accepted` - When a friend request is accepted
- `friend-request-rejected` - When a friend request is rejected

## 🔧 Running the Outbox Processor

### Development

```bash
npm run outbox:dev
```

### Production with PM2

```bash
# Build the project
npm run build

# Start both main server and outbox processor
npm run pm2:start

# Check status
npm run pm2:status

# View logs
npm run pm2:logs
```

### Systemd (Linux)

```bash
sudo cp outbox-processor.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable outbox-processor
sudo systemctl start outbox-processor
```

## 📈 Monitoring

### Check Outbox Status

```bash
npm run outbox:status
```

Output example:

```
📊 Outbox Status:
================
Total Events: 25
Pending: 3
Sent: 20
Failed: 2

Events by Type:
  post-created (sent): 15
  comment-created (pending): 2
  like-created (failed): 1
```

### Retry Failed Events

```bash
npm run outbox:retry
```

### Clean Up Old Events

```bash
npm run outbox:cleanup
```

## 🛠️ Adding New Event Types

### 1. Add Event Helper

In `src/utils/outbox.ts`:

```typescript
export const outboxEvents = {
  // ... existing events
  newEventType: (data: any) => ({
    event_type: "new-event-type",
    payload: {
      type: "new_event_type",
      timestamp: new Date(),
      data: data,
    },
  }),
};
```

### 2. Update Handler

In your handler:

```typescript
import { createOutboxEvent, outboxEvents } from "../../utils/outbox";

const result = await prisma.$transaction(async (tx) => {
  const mainData = await tx.yourTable.create({ data: yourData });

  await createOutboxEvent(tx, outboxEvents.newEventType(mainData));

  return mainData;
});
```

## 🔍 Troubleshooting

### Common Issues

1. **Events stuck in pending**

   - Check if outbox processor is running: `npm run pm2:status`
   - Check Kafka connectivity
   - View logs: `npm run pm2:logs`

2. **Failed events**

   - Check Kafka topic exists
   - Verify event payload format
   - Retry failed events: `npm run outbox:retry`

3. **High memory usage**
   - Clean up old events: `npm run outbox:cleanup`
   - Check for memory leaks in processor

### Debug Commands

```bash
# Check outbox processor logs
pm2 logs outbox-processor

# Restart outbox processor
pm2 restart outbox-processor

# Check database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM outbox WHERE status = 'pending';"

# Monitor real-time events
pm2 logs outbox-processor --lines 100
```

## 📋 Event Schema Examples

### Post Created

```json
{
  "event_type": "post-created",
  "payload": {
    "post_id": "uuid",
    "user_id": "uuid",
    "recipeName": "Pasta Carbonara",
    "cuisine": "Italian",
    "created_at": "2024-01-01T00:00:00Z",
    "image_url": "https://..."
  }
}
```

### Comment Created

```json
{
  "event_type": "comment-created",
  "payload": {
    "type": "comment_created",
    "timestamp": "2024-01-01T00:00:00Z",
    "data": {
      "comment_id": "uuid",
      "content": "Great recipe!",
      "user_id": "uuid",
      "post_id": "uuid"
    }
  }
}
```

## 🔐 Security Considerations

- Outbox events contain sensitive data - ensure proper access controls
- Consider encrypting sensitive payload data
- Implement proper logging and monitoring
- Regular cleanup of old events to prevent data accumulation

## 📚 Further Reading

- [Outbox Pattern - Martin Fowler](https://martinfowler.com/articles/201905-microservices.html#Outbox)
- [Reliable Event Publishing - Confluent](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/)
- [Database Transactions - PostgreSQL](https://www.postgresql.org/docs/current/tutorial-transactions.html)

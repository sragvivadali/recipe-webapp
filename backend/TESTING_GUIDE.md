# Outbox Pattern Testing Guide

This guide provides multiple ways to test the outbox pattern implementation in your recipe app backend.

## 🎯 What We're Testing

1. **Database Transactions**: Verify that main data and outbox events are written atomically
2. **Event Creation**: Confirm outbox events are created for all operations
3. **Outbox Processor**: Test that events are processed and sent to Kafka
4. **Concurrent Writes**: Ensure multiple simultaneous operations work correctly
5. **Fault Tolerance**: Test behavior when Kafka is down or events fail

## 🚀 Prerequisites

Before running tests, ensure:

1. **Server is running**: `npm run dev` or `npm start`
2. **Outbox processor is running**: `npm run outbox:dev` or via PM2
3. **Kafka is running**: Your Kafka cluster should be accessible
4. **Database is connected**: PostgreSQL should be running

## 📋 Testing Methods

### Method 1: Postman Collection (Recommended)

1. **Import the collection**:

   - Open Postman
   - Import `Outbox_Pattern_Tests.postman_collection.json`
   - Set the `baseUrl` variable to `http://localhost:3000`

2. **Run the tests in order**:

   ```
   1. Database Connection Test
   2. Create Post with Outbox
   3. Create Comment with Outbox
   4. Like Post with Outbox
   5. User Signup with Outbox
   6. Send Friend Request with Outbox
   7. Check Outbox Status
   8. Concurrent Writes Test (run multiple times quickly)
   9. Wait for Outbox Processor (wait 5-10 seconds)
   10. Retry Failed Events
   ```

3. **Expected Results**:
   - All API calls should return 201/200 status
   - Outbox status should show pending events
   - After waiting, pending events should become sent

### Method 2: Shell Script

Run the automated test script:

```bash
cd backend
./test-outbox.sh
```

**Expected Output**:

```
🧪 Starting Outbox Pattern Tests...
==================================

1. Testing server health...
✅ Server is running

2. Testing post creation with outbox...
✅ Post created successfully

3. Testing comment creation with outbox...
✅ Comment created successfully

...

🎉 Outbox pattern tests completed!
```

### Method 3: Manual Testing

#### Step 1: Create Test Data

```bash
# Create a post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "recipeName": "Test Recipe",
    "prepTimeMin": 30,
    "difficulty": "Easy",
    "instructions": "Test instructions",
    "cuisine": "Test Cuisine",
    "imageUrl": "https://test-image.jpg"
  }'
```

#### Step 2: Check Outbox Status

```bash
curl http://localhost:3000/api/admin/outbox/status
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "total": 1,
    "pending": 1,
    "sent": 0,
    "failed": 0
  }
}
```

#### Step 3: Wait for Processing

```bash
# Wait 5-10 seconds, then check again
curl http://localhost:3000/api/admin/outbox/status
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "total": 1,
    "pending": 0,
    "sent": 1,
    "failed": 0
  }
}
```

### Method 4: Monitoring Commands

#### Check Outbox Status

```bash
npm run outbox:status
```

#### Retry Failed Events

```bash
npm run outbox:retry
```

#### Clean Up Old Events

```bash
npm run outbox:cleanup
```

## 🔍 Verification Steps

### 1. Database Verification

```sql
-- Check outbox table
SELECT * FROM outbox ORDER BY created_at DESC LIMIT 5;

-- Check main tables
SELECT * FROM posts ORDER BY created_at DESC LIMIT 5;
SELECT * FROM comments ORDER BY created_at DESC LIMIT 5;
```

### 2. Kafka Verification

```bash
# Check if topics exist
kafka-topics --list --bootstrap-server localhost:9092

# Check messages in topics
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic post-created --from-beginning
```

### 3. Log Verification

```bash
# Check outbox processor logs
pm2 logs outbox-processor

# Check server logs
pm2 logs recipe-backend
```

## 🐛 Troubleshooting

### Common Issues

1. **"Server is not running"**

   ```bash
   # Start the server
   npm run dev
   ```

2. **"Outbox processor not running"**

   ```bash
   # Start outbox processor
   npm run outbox:dev

   # Or via PM2
   npm run pm2:start
   ```

3. **"Kafka connection failed"**

   - Check if Kafka is running
   - Verify Kafka configuration in `.env`
   - Check network connectivity

4. **"Events stuck in pending"**

   ```bash
   # Check processor logs
   pm2 logs outbox-processor

   # Manually retry failed events
   npm run outbox:retry
   ```

5. **"Database connection failed"**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in `.env`
   - Run migrations: `npx prisma migrate dev`

### Debug Commands

```bash
# Check all services status
pm2 status

# View all logs
pm2 logs

# Restart all services
pm2 restart all

# Check database connection
npx prisma db pull

# Check outbox table directly
npx prisma studio
```

## 📊 Expected Test Results

### Successful Test Run Should Show:

1. **API Responses**: All endpoints return 201/200 status codes
2. **Outbox Events**: Events appear in outbox table with 'pending' status
3. **Processing**: After 5-10 seconds, events change to 'sent' status
4. **Kafka Messages**: Messages appear in Kafka topics
5. **Concurrent Operations**: Multiple simultaneous requests work correctly

### Sample Successful Output:

```
✅ Server is running
✅ Post created successfully
✅ Comment created successfully
✅ Post liked successfully
✅ User signup successful
✅ Friend request sent successfully

📊 Outbox Status: {"total":6,"pending":6,"sent":0,"failed":0}
📊 Outbox Status After Processing: {"total":6,"pending":0,"sent":6,"failed":0}
```

## 🎯 Test Scenarios

### Scenario 1: Normal Operation

- Create posts, comments, likes
- Verify outbox events are created
- Wait for processor to send to Kafka
- Verify events are marked as sent

### Scenario 2: Concurrent Writes

- Send multiple requests simultaneously
- Verify all outbox events are created
- Check no data corruption occurs

### Scenario 3: Fault Tolerance

- Stop Kafka temporarily
- Create some operations
- Verify outbox events remain pending
- Restart Kafka
- Verify events are processed

### Scenario 4: Recovery

- Create failed events (by stopping Kafka)
- Use retry functionality
- Verify events are reprocessed

## 📝 Test Checklist

- [ ] Server starts without errors
- [ ] Outbox processor starts without errors
- [ ] Database connection works
- [ ] Kafka connection works
- [ ] API endpoints respond correctly
- [ ] Outbox events are created for all operations
- [ ] Events are processed and sent to Kafka
- [ ] Concurrent operations work correctly
- [ ] Failed events can be retried
- [ ] Monitoring endpoints work correctly

## 🚀 Next Steps

After successful testing:

1. **Monitor in production**: Use PM2 monitoring
2. **Set up alerts**: For failed events or high pending counts
3. **Scale as needed**: Add more outbox processor instances
4. **Add more event types**: Extend the pattern to new features

The outbox pattern is now ready for production use! 🎉

# Recipe App Backend

A Node.js/Express backend with fault-tolerant event publishing using the **Outbox Pattern**. Built with TypeScript, Prisma ORM, PostgreSQL, and Apache Kafka.

## 🏗️ Architecture

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Layer     │    │   Database      │    │   Event System  │
│   (Express)     │    │   (PostgreSQL)  │    │   (Kafka)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Handlers      │───▶│   Outbox Table  │───▶│   Outbox        │
│   (Business     │    │   (Events)      │    │   Processor     │
│    Logic)       │    └─────────────────┘    └─────────────────┘
└─────────────────┘
```

### Key Features

- **🔐 Authentication**: JWT-based auth with bcrypt password hashing
- **📝 Posts & Comments**: Recipe sharing with likes and comments
- **👥 Social Features**: Friend requests and user relationships
- **🛡️ Fault Tolerance**: Outbox pattern for reliable event publishing
- **⚡ Concurrency Safe**: Handles multiple simultaneous operations
- **📊 Monitoring**: Real-time status checking and health monitoring

### Outbox Pattern Implementation

The outbox pattern ensures **atomicity** between database writes and event publishing:

1. **Write Phase**: Main data + outbox event written in single transaction
2. **Process Phase**: Background processor sends events to Kafka
3. **Recovery**: Failed events can be retried automatically

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL database

### 1. Start Infrastructure Services

```bash
# From the main project directory
docker-compose up -d
```

This starts:

- **Kafka** (port 9092) - Event streaming
- **Zookeeper** (port 2181) - Kafka coordination
- **Kafdrop** (port 9000) - Kafka UI for monitoring

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) View database in browser
npx prisma studio
```

### 4. Configure Environment

Create `.env` file in backend directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/recipe_app"

# Kafka
KAFKA_BROKERS="localhost:9092"

# JWT Secret
JWT_SECRET="your-secret-key"

# Server
PORT=3000
```

### 5. Start Services

#### Development Mode

```bash
# Terminal 1: Start main server
npm run dev

# Terminal 2: Start outbox processor
npm run outbox:dev
```

#### Production Mode

```bash
# Build the project
npm run build

# Start all services with PM2
npm run pm2:start

# Check status
npm run pm2:status
```

## 📊 Monitoring & Status

### Check Service Status

```bash
# Check all PM2 processes
npm run pm2:status

# View logs
npm run pm2:logs

# Check outbox status
npm run outbox:status
```

### Health Checks

```bash
# Server health
curl http://localhost:3000/health

# Outbox status
curl http://localhost:3000/api/admin/outbox/status

# Kafka topics (via Kafdrop)
open http://localhost:9000
```

### Database Status

```bash
# Check database connection
npx prisma db pull

# View outbox table
npx prisma studio
```

## 🧪 Testing

### Automated Testing

```bash
# Run shell script tests
./test-outbox.sh

# Import Postman collection
# Outbox_Pattern_Tests.postman_collection.json
```

### Manual Testing

```bash
# Create a test post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "recipeName": "Test Recipe",
    "prepTimeMin": 30,
    "difficulty": "Easy"
  }'

# Check outbox status
curl http://localhost:3000/api/admin/outbox/status
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── handler/           # Business logic handlers
│   │   ├── auth/         # Authentication
│   │   ├── posts/        # Post management
│   │   └── friends/      # Social features
│   ├── routes/           # Express routes
│   ├── kafka/            # Event streaming
│   │   ├── producer.ts   # Kafka producer
│   │   ├── consumer.ts   # Kafka consumer
│   │   └── outboxProcessor.ts # Outbox processor
│   ├── utils/            # Utilities
│   │   ├── outbox.ts     # Outbox helpers
│   │   └── outboxMonitor.ts # Monitoring
│   └── middleware/       # Express middleware
├── prisma/               # Database schema & migrations
├── tests/                # Test files
└── docs/                 # Documentation
```

## 🔧 Available Scripts

### Development

```bash
npm run dev              # Start development server
npm run outbox:dev       # Start outbox processor (dev)
npm run build            # Build for production
```

### Production

```bash
npm run start            # Start production server
npm run outbox:start     # Start outbox processor (prod)
npm run pm2:start        # Start all services with PM2
npm run pm2:stop         # Stop all services
npm run pm2:restart      # Restart all services
```

### Monitoring

```bash
npm run outbox:status    # Check outbox status
npm run outbox:retry     # Retry failed events
npm run outbox:cleanup   # Clean up old events
npm run pm2:status       # Check PM2 status
npm run pm2:logs         # View PM2 logs
```

## 🛠️ API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Posts

- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get post
- `POST /api/posts/:id/comments` - Add comment
- `POST /api/posts/like` - Like post

### Social

- `POST /api/friends/request` - Send friend request
- `POST /api/friends/respond` - Respond to request

### Admin

- `GET /api/admin/outbox/status` - Check outbox status
- `POST /api/admin/outbox/retry` - Retry failed events
- `POST /api/admin/outbox/cleanup` - Clean up old events

## 🔍 Troubleshooting

### Common Issues

1. **"Kafka connection failed"**

   ```bash
   # Check if Kafka is running
   docker-compose ps

   # Restart Kafka
   docker-compose restart kafka
   ```

2. **"Database connection failed"**

   ```bash
   # Check DATABASE_URL in .env
   # Run migrations
   npx prisma migrate dev
   ```

3. **"Outbox processor not running"**

   ```bash
   # Check PM2 status
   npm run pm2:status

   # Start manually
   npm run outbox:dev
   ```

4. **"Events stuck in pending"**

   ```bash
   # Check processor logs
   npm run pm2:logs

   # Retry failed events
   npm run outbox:retry
   ```

### Debug Commands

```bash
# Check all services
pm2 status

# View all logs
pm2 logs

# Check database
npx prisma studio

# Check Kafka topics
curl http://localhost:9000/api/topic
```

## 📈 Performance & Scaling

### Current Configuration

- **Outbox Processor**: 2-second intervals, batch size 10
- **Database**: PostgreSQL with connection pooling
- **Kafka**: Single broker (can be scaled to cluster)

### Scaling Options

- **Multiple Outbox Processors**: Run multiple instances
- **Kafka Cluster**: Add more brokers
- **Database**: Read replicas for queries
- **Load Balancing**: Multiple server instances

## 🔐 Security

- **JWT Authentication**: Stateless token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Express rate limiter on auth routes
- **CORS**: Configured for frontend integration
- **Input Validation**: Request body validation

## 📚 Documentation

- [Outbox Pattern Guide](./OUTBOX_PATTERN.md) - Detailed outbox implementation
- [Testing Guide](./TESTING_GUIDE.md) - Comprehensive testing instructions
- [Postman Collection](./Outbox_Pattern_Tests.postman_collection.json) - API tests

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📄 License

This project is licensed under the MIT License.

---

**Happy Cooking! 🍳**

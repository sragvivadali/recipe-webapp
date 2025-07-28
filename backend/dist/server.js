"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = __importDefault(require("./routes/auth"));
const posts_1 = __importDefault(require("./routes/posts"));
const friends_1 = __importDefault(require("./routes/friends"));
const producer_1 = require("./kafka/producer");
const consumer_1 = require("./kafka/consumer");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// 🔐 Rate limit config (auth routes only)
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per IP
    message: 'Too many requests from this IP, please try again later.',
});
// 🧩 Global middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 🛣️ Route definitions
app.use('/api/auth', authLimiter, auth_1.default);
app.use('/api/posts', posts_1.default);
app.use('/api/friends', friends_1.default);
// ❤️ Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});
// 🚀 Start Kafka + server
const startServer = async () => {
    try {
        await producer_1.producer.connect();
        console.log('✅ Connected to Kafka producer');
        await (0, consumer_1.startKafkaConsumer)();
        console.log('✅ Kafka consumer started');
        app.listen(PORT, () => {
            console.log(`🚀 Server is running at http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};
startServer();

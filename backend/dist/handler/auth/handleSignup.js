"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSignup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
const handleSignup = async (req, res) => {
    const { username, email: rawEmail, password } = req.body;
    const email = rawEmail.toLowerCase().trim();
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username,
                    email,
                    password_hash: passwordHash,
                },
            });
            await tx.outbox.create({
                data: {
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
                },
            });
            return user;
        });
        return res.status(201).json({
            message: 'User created successfully',
            user: {
                user_id: result.user_id,
                username: result.username,
                email: result.email,
            },
        });
    }
    catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.handleSignup = handleSignup;

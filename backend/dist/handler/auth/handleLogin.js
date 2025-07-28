"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLogin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
const handleLogin = async (req, res) => {
    const { identifier, password } = req.body; // identifier = email or username
    if (!identifier || !password) {
        return res.status(400).json({ error: 'Missing identifier or password' });
    }
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: identifier },
                    { email: identifier.toLowerCase().trim() }
                ]
            }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.user_id,
            username: user.username,
            email: user.email
        }, process.env.JWT_SECRET, { expiresIn: '1d' });
        // ✅ Explicitly return user_id so Postman can save it
        return res.status(200).json({
            token,
            id: user.user_id,
            username: user.username,
            email: user.email
        });
    }
    catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.handleLogin = handleLogin;

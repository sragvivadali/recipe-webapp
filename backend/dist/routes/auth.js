"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handleSignup_1 = require("../handler/auth/handleSignup");
const handleLogin_1 = require("../handler/auth/handleLogin");
const router = express_1.default.Router();
router.post('/signup', handleSignup_1.handleSignup);
router.post('/login', handleLogin_1.handleLogin);
exports.default = router;

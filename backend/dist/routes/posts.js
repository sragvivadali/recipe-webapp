"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const createPost_1 = require("../handler/posts/createPost");
const getUserPost_1 = require("../handler/posts/getUserPost");
const likePost_1 = require("../handler/posts/likePost");
const createComment_1 = require("../handler/posts/createComment");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, createPost_1.createPost); // POST /posts
router.get('/:userId', auth_1.authenticate, getUserPost_1.getUserPosts); // GET /posts/:userId
router.post('/:postId/like', auth_1.authenticate, likePost_1.likePost); // POST /posts/:postId/like
router.post('/:postId/comment', auth_1.authenticate, createComment_1.createComment); // POST /posts/:postId/comment
exports.default = router;

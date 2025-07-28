"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sendFriendRequest_1 = require("../handler/friends/sendFriendRequest");
const respondFriendRequest_1 = require("../handler/friends/respondFriendRequest");
const router = express_1.default.Router();
router.post('/request', sendFriendRequest_1.sendFriendRequest);
router.post('/respond', respondFriendRequest_1.respondToFriendRequest);
exports.default = router;

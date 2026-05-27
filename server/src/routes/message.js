const express = require("express");
const router = express.Router();
const messageController = require("../controller/message");
const { authenticateToken } = require("../utils/jwtAuth");

router.post("/enterpriseSendMessage", authenticateToken, messageController.enterpriseSendMessage)

// 新增：获取所有关联聊天记录
router.post("/getmessageslist", authenticateToken, messageController.getmessageslist);
router.post("/getChatMessages", authenticateToken, messageController.getChatMessages);
router.post("/studentSendMessage", authenticateToken, messageController.studentSendMessage);


module.exports = router;
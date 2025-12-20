const express = require("express");
const router = express.Router();
const messageController = require("../controller/message");
const {authenticateToken} = require("../utils/jwtAuth");

router.post("/enterpriseSendMessage",messageController.enterpriseSendMessage)

// 新增：获取所有关联聊天记录
router.post("/getmessageslist", messageController.getmessageslist);
router.post("/getChatMessages", messageController.getChatMessages);
router.post("/studentSendMessage", messageController.studentSendMessage);


module.exports = router;
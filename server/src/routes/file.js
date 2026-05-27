const express = require("express");
const router = express.Router();
const upload = require("../utils/upload");
const { authenticateToken } = require("../utils/jwtAuth");

// 简历上传路由
router.post("/uploadResume", authenticateToken, upload.uploadResume);

module.exports = router;
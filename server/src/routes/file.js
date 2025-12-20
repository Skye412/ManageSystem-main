const express = require("express");
const router = express.Router();
const upload = require("../utils/upload");

// 简历上传路由
router.post("/uploadResume", upload.uploadResume);

module.exports = router;
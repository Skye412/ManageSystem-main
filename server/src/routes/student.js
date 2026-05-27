const express = require("express");
const router = express.Router();
const studentController = require("../controller/student");
const {authenticateToken} = require("../utils/jwtAuth");

router.post("/getStudentInfo",authenticateToken, studentController.getStudentInfo);
router.post("/submitResume",authenticateToken, studentController.submitResume);
router.post("/getResumeDeliveries",authenticateToken, studentController.getResumeDeliveries); // 新增

module.exports = router;
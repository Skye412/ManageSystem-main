const express = require("express");
const router = express.Router();
const manageController = require("../controller/manage");
const {authenticateToken} = require("../utils/jwtAuth");

router.post("/addMajorClass",authenticateToken,manageController.addMajorClass);
router.get("/getMajorsAndClasses", authenticateToken,manageController.getMajorsAndClasses);
router.post("/addMajorClass",authenticateToken,manageController.addMajorClass);
router.post("/getStudentsByClassName",authenticateToken,manageController.getStudentsByClassName);
router.post("/addMajorClass",authenticateToken,manageController.addMajorClass);
router.post("/addStudentToClass",authenticateToken,manageController.addStudentToClass);
router.post("/addEnterprise",authenticateToken,manageController.addEnterprise);
router.get("/getAllEnterprises",authenticateToken,manageController.getAllEnterprises);
router.get("/getPositions",authenticateToken, manageController.getPositions);
router.post("/addPosition",authenticateToken,manageController.addPosition);
router.post("/deletePosition", authenticateToken,manageController.deletePosition);
router.get("/getPositionDetail/:id",authenticateToken, manageController.getPositionDetail);
router.get("/getEmploymentStatistics",authenticateToken, manageController.getEmploymentStatistics);

router.get("/getNotices", authenticateToken,manageController.getNotices);

router.post("/addNotice",authenticateToken, manageController.addNotice);
router.post("/deleteNotice",authenticateToken, manageController.deleteNotice);
router.get("/getNoticeDetail/:id",authenticateToken, manageController.getNoticeDetail); // 新增

router.post("/reviewPosition",authenticateToken, manageController.reviewPosition); // 新增审核职位路由

module.exports = router;
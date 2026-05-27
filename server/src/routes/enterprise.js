const express = require("express");
const router = express.Router();
const enterpriseController = require("../controller/enterprise");
const { authenticateToken } = require("../utils/jwtAuth");

router.post("/getPositionsByCompanyName", authenticateToken, enterpriseController.getPositionsByCompanyName);
router.post("/addPosition", authenticateToken, enterpriseController.addPosition);
router.post("/getPositionDetail", authenticateToken, enterpriseController.getPositionDetail);
router.post("/deletePosition", authenticateToken, enterpriseController.deletePosition);
router.post("/updatePosition", authenticateToken, enterpriseController.updatePosition);
router.post("/getDeliveriesByEnterpriseId", authenticateToken, enterpriseController.getDeliveriesByEnterpriseId);
router.post("/inviteInterview", authenticateToken, enterpriseController.inviteInterview);
router.post("/acceptCandidate", authenticateToken, enterpriseController.acceptCandidate);
router.post("/rejectCandidate", authenticateToken, enterpriseController.rejectCandidate);
router.post("/markAsViewed", authenticateToken, enterpriseController.markAsViewed);

module.exports = router;
const express = require("express");
const router = express.Router();
const enterpriseController = require("../controller/enterprise");

router.post("/getPositionsByCompanyName",enterpriseController.getPositionsByCompanyName);
router.post("/addPosition",enterpriseController.addPosition);
router.post("/getPositionDetail",enterpriseController.getPositionDetail);
router.post("/deletePosition",enterpriseController.deletePosition);
router.post("/updatePosition",enterpriseController.updatePosition);
router.post("/getDeliveriesByEnterpriseId", enterpriseController.getDeliveriesByEnterpriseId);
router.post("/inviteInterview", enterpriseController.inviteInterview);
router.post("/acceptCandidate", enterpriseController.acceptCandidate);
router.post("/rejectCandidate", enterpriseController.rejectCandidate);
router.post("/markAsViewed", enterpriseController.markAsViewed);

module.exports = router;
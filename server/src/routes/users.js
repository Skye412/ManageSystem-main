const express = require("express");
const router = express.Router();
const userController = require("../controller/user");
const { authenticateToken, authenticateRefreshToken } = require("../utils/jwtAuth");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/adminLogin', userController.adminLogin);
//学生登录
router.post('/studentLogin', userController.studentLogin);
router.post('/changePassword', userController.changePassword);
router.post("/enterpriseLogin", userController.enterpriseLogin); 
// 修正中间件位置，将authenticateToken作为第一个参数
router.post("/adminLogout", authenticateToken, userController.adminLogout);
router.post("/enterpriseLogout", authenticateToken, userController.enterpriseLogout);
router.post("/studentLogout", authenticateToken, userController.studentLogout);

// 新增刷新令牌路由
router.post("/refreshToken", authenticateRefreshToken, userController.refreshAccessToken);

module.exports = router;

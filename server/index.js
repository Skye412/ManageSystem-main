require('dotenv').config();
const app = require("./src/app"); // 引入 app.js
const db = require("./src/modle/db");

// 启动服务
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`服务运行在 ${PORT}端口`);
});

// 优雅关闭
const gracefulShutdown = (signal) => {
  console.log(`收到 ${signal}，正在优雅关闭...`);
  server.close(() => {
    console.log('HTTP 服务已关闭');
    db.end(() => {
      console.log('数据库连接池已关闭');
      process.exit(0);
    });
  });
  // 10秒后强制退出
  setTimeout(() => {
    console.error('强制退出');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

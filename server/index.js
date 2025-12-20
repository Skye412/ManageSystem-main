const app = require("./src/app"); // 引入 app.js


// 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务运行在 ${PORT}端口`);
});

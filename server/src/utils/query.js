const db = require("../modle/db"); // 引入连接池

/**
 * 执行SQL查询
 * @param {string} sql - SQL查询语句
 * @param {Array} [values] - SQL查询中的参数值数组
 * @returns {Promise} - 返回一个Promise对象，解析为查询结果
 */
function executeQuery(sql, values = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = executeQuery;

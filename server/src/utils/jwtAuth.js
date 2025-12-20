//jwt验证中间件
const jwt = require('jsonwebtoken');
const config = require('../modle/config.json');

const secretKey= config.secretKey;

const refreshSecretKey = config.refreshSecretKey
//验证访问令牌中间件

/**
 * 验证用户请求中的令牌是否有效
 * 
 * 此函数主要用于验证用户请求中的令牌是否有效。它会从请求头中提取出令牌，
 * 并使用密钥对令牌进行验证。如果令牌有效，会将解码后的用户信息附加到请求对象上，
 * 并允许请求继续进行。如果令牌无效或未提供，则返回错误响应。
 * 
 * @param {Object} req - Express请求对象，包含请求的所有信息
 * @param {Object} res - Express响应对象，用于发送HTTP响应
 * @param {Function} next - Express中的下一个中间件或路由处理函数
 */
const authenticateToken = async (req, res, next) => {
  try {
      // 提取请求头中的Authorization字段
      const authHeader = req.headers.authorization;
      // 分割Authorization字段的值，以提取实际的令牌部分
      const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
      console.log(token);
      // 如果没有提供令牌，抛出错误
      if (!token) {
          throw new Error('未提供令牌');
      }

      // 使用密钥验证令牌，并解码令牌中的信息
      const decoded = jwt.verify(token, secretKey);
      // 将解码后的用户信息附加到请求对象上
      req.user = decoded;
      
      console.log(`用户 ${decoded.username} 认证成功`);

      // 允许请求继续进行到下一个中间件或路由处理函数
      next();
  } catch (err) {
      // 记录认证错误的日志
      console.log(`认证错误: ${err.message}`);
      // 发送HTTP 403错误响应，指示令牌无效或已过期
      res.json({code:403, message: '令牌无效或已过期' });
  }
}

const { client } = require('../controller/user');


const authenticateRefreshToken = async (req, res, next) => {
  try {
    const {refreshToken} = req.body;
    
    if (!refreshToken){
      return res.json({code:401, message: '无效的刷新令牌' });
    }

    const decoded = jwt.verify(refreshToken, refreshSecretKey);
    

    const storedToken = await client.get(`refreshToken:${decoded.username}`); 
    if (storedToken !== refreshToken) {
      return res.json({code:401, message: '刷新令牌已失效' }); 
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.json({code:401, message: '无效的刷新令牌' });
  }
}

module.exports = {
    authenticateToken,
    authenticateRefreshToken 
}
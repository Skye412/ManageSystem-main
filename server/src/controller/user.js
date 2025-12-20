const executeQuery = require("../utils/query");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken"); // 引入jsonwebtoken库
const { createClient } = require("ioredis"); // 引入Redis客户端
const refreshSecretKey = require("../../src/modle/config.json").refreshSecretKey;
const secretKey  = require("../../src/modle/config.json").secretKey;

const client = createClient();

// 新增管理员退出函数
async function adminLogout(req, res) {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({
                code: 400,
                message: "缺少必要参数"
            });
        }
        
        // 统一键名格式
        const deleteCount = await client.del(`refreshToken:${username}`);
        if (deleteCount === 0) {
            console.warn(`未找到用户 ${username} 的刷新令牌`);
        }

        res.status(200).json({
            code: 200,
            message: "成功退出登录",
        });
    } catch (error) {
        console.error("退出登录失败:", error.message);
        res.status(500).json({
            code: 500,
            message: "服务器内部错误，退出失败"
        });
    }
}

// 新增企业退出函数
async function enterpriseLogout(req, res) {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({
                code: 400,
                message: "缺少必要参数"
            });
        }
        
        // 统一键名格式
        const deleteCount = await client.del(`refreshToken:${name}`);
        if (deleteCount === 0) {
            console.warn(`未找到企业 ${name} 的刷新令牌`);
        }

        res.status(200).json({
            code: 200,
            message: "成功退出登录",
        });
    } catch (error) {
        console.error("企业退出登录失败:", error.message);
        res.status(500).json({
            code: 500,
            message: "服务器内部错误，退出失败"
        });
    }
}

// 新增学生退出函数
async function studentLogout(req, res) {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({
                code: 400,
                message: "缺少必要参数"
            });
        }
        
        // 统一键名格式
        const deleteCount = await client.del(`refreshToken:${name}`);
        if (deleteCount === 0) {
            console.warn(`未找到学生 ${name} 的刷新令牌`);
        }

        res.status(200).json({
            code: 200,
            message: "成功退出登录",
        });
    } catch (error) {
        console.error("学生退出登录失败:", error.message);
        res.status(500).json({
            code: 500,
            message: "服务器内部错误，退出失败"
        });
    }
}

/**
 * 管理员登录函数
 * @param {string} username - 管理员用户名
 * @param {string} password - 管理员密码
 * @returns {Promise<Object>} - 返回管理员信息或错误信息
 */
async function adminLogin(req, res) {
    const { username, password } = req.body;
    try {
        // 参数校验
        if (!username || !password) {
            return res.json({
                code: 400,
                message: "用户名或密码不能为空",
            });
        }
        const sql = "SELECT * FROM admins WHERE username = ? AND password = ?";
        const results = await executeQuery(sql, [username, password]);
        if (results.length === 0) {
            return res.json({
                code: 400,
                message: "用户名或密码错误",
            });
        }
        const admin = results[0];
        // 排除密码字段
        const { password: _, ...adminData } = admin;
        const accesstoken = jwt.sign(
            { id:adminData.id,username:adminData.username,role:adminData.role },
            secretKey,
            { expiresIn: "15m" },
          );

          // 生成刷新令牌，有效期设置为7天
        const refreshtoken = jwt.sign(
            { id:adminData.id,username:adminData.username,role:adminData.role },
            refreshSecretKey,
            { expiresIn: "7d" },
          );

          await client.set(`refreshToken:${adminData.username}`, refreshtoken);
      
        res.json({
            code: 200,
            message: "登录成功",
            data: adminData,
            accesstoken: accesstoken,
            refreshtoken: refreshtoken,
        });
    } catch (error) {
        console.error("管理员登录失败:", error.message); // 增强日志记录
        res.json({
            code: 500,
            message: "服务器内部错误，请稍后重试", 
        });
    }
}

/**
 * 学生登录函数
 * @param {string} studentId - 学生学号
 * @param {string} password - 学生密码
 * @returns {Promise<Object>} - 返回学生信息或错误信息
 */
async function studentLogin(req, res) {
    const { studentId, password } = req.body;
    try {
        // 参数校验
        if (!studentId || !password) {
            return res.json({
                code: 400,
                message: "学号或密码不能为空",
            });
        }
        const sql = "SELECT * FROM students WHERE student_id = ?";
        const results = await executeQuery(sql, [studentId]);
        if (results.length === 0) {
            return res.json({
                code: 400,
                message: "学号不存在",
            });
        }
        const student = results[0];
        // 判断是否为第一次登录
        let isFirstLogin = false;
        if (student.password === '123456') {
            if (password === '123456') {
                isFirstLogin = true;
            } else {
                return res.json({
                    code: 400,
                    message: "密码错误",
                });
            }
        } else {
            // 使用哈希比对密码
            const isMatch = await bcrypt.compare(password, student.password);
            if (isMatch) {
                isFirstLogin = false;
            } else {
                return res.json({
                    code: 400,
                    message: "密码错误",
                });
            }
        }
        // 排除密码字段
        const { password: _, ...studentData } = student;
        const accesstoken = jwt.sign(
            { id:studentData.id,username:studentData.name,role:'student' },
            secretKey,
            { expiresIn: "15m" },
          );
          const refreshtoken = jwt.sign(
            { id:studentData.id,username:studentData.name,role:'student' },
            refreshSecretKey,
            { expiresIn: "7d" },
          );
          await client.set(`refreshToken:${studentData.name}`, refreshtoken);
        res.json({
            code: 200,
            message: "登录成功",
            data: studentData,
            accesstoken: accesstoken,
            refreshtoken: refreshtoken,
            isFirstLogin: isFirstLogin, // 添加标识
        });
    } catch (error) {
        console.error("学生登录失败:", error.message);
        res.json({
            code: 500,
            message: "服务器内部错误，请稍后重试",
        });
    }
}

/**
 * 更改密码函数
 * @param {string} studentId - 学生学号
 * @param {string} oldPassword - 旧密码
 * @param {string} newPassword - 新密码
 * @returns {Promise<Object>} - 返回成功或错误信息
 */
async function changePassword(req, res) {
    const { studentId, newPassword } = req.body;
    try {
        // 参数校验
        if (!studentId || !oldPassword || !newPassword) {
            return res.json({
                code: 400,
                message: "学号或密码不能为空",
            });
        }
        const sql = "SELECT * FROM students WHERE student_id = ?";
        const results = await executeQuery(sql, [studentId]);
        if (results.length === 0) {
            return res.json({
                code: 400,
                message: "学号不存在",
            });
        }
        const student = results[0];
        // 判断是否为第一次登录
        if (student.password === '123456') {
            if (oldPassword !== '123456') {
                return res.json({
                    code: 400,
                    message: "旧密码错误",
                });
            }
        } else {
            // 使用哈希比对旧密码
            const isMatch = await bcrypt.compare(oldPassword, student.password);
            if (!isMatch) {
                return res.json({
                    code: 400,
                    message: "旧密码错误",
                });
            }
        }
        // 哈希存储新密码
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateSql = "UPDATE students SET password = ? WHERE student_id = ?";
        await executeQuery(updateSql, [hashedPassword, studentId]);
        res.json({
            code: 200,
            message: "密码更改成功",
        });
    } catch (error) {
        console.error("更改密码失败:", error.message);
        res.json({
            code: 500,
            message: "服务器内部错误，请稍后重试",
        });
    }
}

/**
 * 企业用户登录函数
 * @param {string} name - 企业名称
 * @param {string} password - 企业密码
 * @returns {Promise<Object>} - 返回企业信息或错误信息
 */
async function enterpriseLogin(req, res) {
    const { name, password } = req.body;
    try {
        // 参数校验
        if (!name || !password) {
            return res.json({
                code: 400,
                message: "企业名称或密码不能为空",
            });
        }

        // 查询企业信息
        const sql = "SELECT * FROM enterprises WHERE name = ?";
        const results = await executeQuery(sql, [name]);
        
        // 验证企业是否存在
        if (results.length === 0) {
            return res.json({
                code: 400,
                message: "企业不存在",
            });
        }

        const enterprise = results[0];
        
        // 判断是否为第一次登录
        let isFirstLogin = false;
        if (enterprise.password === '123456') {
            if (password === '123456') {
                isFirstLogin = true;
            } else {
                return res.json({
                    code: 400,
                    message: "密码错误",
                });
            }
        } else {
            // 使用哈希比对密码
            const isMatch = await bcrypt.compare(password, enterprise.password);
            if (!isMatch) {
                return res.json({
                    code: 400,
                    message: "密码错误",
                });
            }
        }

        // 排除密码字段
        const { password: _, ...enterpriseData } = enterprise;

        const accesstoken = jwt.sign(
            { id:enterpriseData.id,username:enterpriseData.name,role:'enterprise' },
            secretKey,
            { expiresIn: "15m" },
          );
          const refreshtoken = jwt.sign(
            { id:enterpriseData.id,username:enterpriseData.name,role:'enterprise' },
            refreshSecretKey,
            { expiresIn: "7d" }
          );
          await client.set(`refreshToken:${enterpriseData.name}`, refreshtoken);
        
        res.json({
            code: 200,
            message: "登录成功",
            data: enterpriseData,
            accesstoken: accesstoken,
            refreshtoken: refreshtoken,
            isFirstLogin: isFirstLogin, // 添加标识
        });
    } catch (error) {
        console.error("企业登录失败:", error.message);
        res.json({
            code: 500,
            message: "服务器内部错误，请稍后重试",
        });
    }
}

// 新增刷新令牌函数
async function refreshAccessToken(req, res) {
    try {
        const user = req.user; // 从中间件获取已解码的用户信息

        // 仅生成新的访问令牌，不更新刷新令牌
        const newAccessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            secretKey,
            { expiresIn: "15m" }
        );

        res.json({
            code: 200,
            message: "令牌刷新成功",
            accesstoken: newAccessToken
        });
    } catch (error) {
        console.error("刷新令牌失败:", error.message);
        res.json({
            code: 500,
            message: "令牌刷新失败"
        });
    }
}

module.exports = {
  adminLogin,
  studentLogin,
  changePassword,
  enterpriseLogin,
  adminLogout,
  enterpriseLogout,
  studentLogout,
  refreshAccessToken,
  client  // 导出Redis客户端实例供其他模块使用
};
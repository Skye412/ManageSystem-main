const executeQuery = require("../utils/query");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken"); // 引入jsonwebtoken库
const { createClient } = require("ioredis"); // 引入Redis客户端
const refreshSecretKey = process.env.JWT_REFRESH_SECRET || require("../../src/modle/config.json").refreshSecretKey;
const secretKey = process.env.JWT_SECRET || require("../../src/modle/config.json").secretKey;

const client = createClient();
client.connect().catch(err => console.error('Redis连接失败:', err.message));
client.on('error', err => console.error('Redis错误:', err.message));

// 统一退出登录函数
async function logout(req, res) {
    try {
        const { username } = req.user || {};
        if (!username) {
            return res.status(400).json({ code: 400, message: "缺少必要参数" });
        }
        const deleteCount = await client.del(`refreshToken:${username}`);
        if (deleteCount === 0) {
            console.warn(`未找到用户 ${username} 的刷新令牌`);
        }
        res.status(200).json({ code: 200, message: "成功退出登录" });
    } catch (error) {
        console.error("退出登录失败:", error.message);
        res.status(500).json({ code: 500, message: "服务器内部错误，退出失败" });
    }
}

/**
 * 通用登录函数
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Object} options - 配置项
 * @param {string} options.table - 数据库表名
 * @param {string} options.idField - 数据库中的ID字段名
 * @param {string} options.bodyIdField - 请求体中的ID字段名
 * @param {string} options.role - 用户角色
 */
async function login(req, res, { table, idField, bodyIdField, role }) {
    const bodyId = req.body[bodyIdField];
    const { password } = req.body;
    try {
        if (!bodyId || !password) {
            return res.status(400).json({ code: 400, message: "用户名或密码不能为空" });
        }
        const sql = `SELECT * FROM ${table} WHERE ${idField} = ?`;
        const results = await executeQuery(sql, [bodyId]);
        if (results.length === 0) {
            return res.status(400).json({ code: 400, message: role === 'student' ? "学号不存在" : role === 'enterprise' ? "企业不存在" : "用户名或密码错误" });
        }
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ code: 400, message: "密码错误" });
        }
        // 自动迁移明文密码为bcrypt哈希
        if (!user.password.startsWith('$2')) {
            const hashed = await bcrypt.hash(password, 10);
            await executeQuery(`UPDATE ${table} SET password = ? WHERE id = ?`, [hashed, user.id]);
        }
        // 判断是否为默认密码（首次登录）
        const isFirstLogin = await bcrypt.compare('123456', user.password);
        const { password: _, ...userData } = user;
        const username = userData.username || userData.name;
        const accesstoken = jwt.sign(
            { id: userData.id, username, role },
            secretKey,
            { expiresIn: "15m" },
        );
        const refreshtoken = jwt.sign(
            { id: userData.id, username, role },
            refreshSecretKey,
            { expiresIn: "7d" },
        );
        await client.set(`refreshToken:${username}`, refreshtoken);
        res.status(200).json({
            code: 200, message: "登录成功", data: userData,
            accesstoken, refreshtoken, isFirstLogin,
        });
    } catch (error) {
        console.error(`${role}登录失败:`, error.message);
        res.status(500).json({ code: 500, message: "服务器内部错误，请稍后重试" });
    }
}

async function adminLogin(req, res) {
    return login(req, res, { table: 'admins', idField: 'username', bodyIdField: 'username', role: 'admin' });
}

async function studentLogin(req, res) {
    return login(req, res, { table: 'students', idField: 'student_id', bodyIdField: 'studentId', role: 'student' });
}

async function enterpriseLogin(req, res) {
    return login(req, res, { table: 'enterprises', idField: 'name', bodyIdField: 'name', role: 'enterprise' });
}

/**
 * 更改密码函数
 * @param {string} studentId - 学生学号
 * @param {string} oldPassword - 旧密码
 * @param {string} newPassword - 新密码
 * @returns {Promise<Object>} - 返回成功或错误信息
 */
async function changePassword(req, res) {
    const { studentId, oldPassword, newPassword } = req.body;
    try {
        // 参数校验
        if (!studentId || !oldPassword || !newPassword) {
            return res.status(400).json({ code: 400,
                message: "学号或密码不能为空",
            });
        }
        const sql = "SELECT * FROM students WHERE student_id = ?";
        const results = await executeQuery(sql, [studentId]);
        if (results.length === 0) {
            return res.status(404).json({ code: 404,
                message: "学号不存在",
            });
        }
        const student = results[0];
        // 统一使用bcrypt验证旧密码
        const isMatch = await bcrypt.compare(oldPassword, student.password);
        if (!isMatch) {
            return res.status(400).json({ code: 400,
                message: "旧密码错误",
            });
        }
        // 哈希存储新密码
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateSql = "UPDATE students SET password = ? WHERE student_id = ?";
        await executeQuery(updateSql, [hashedPassword, studentId]);
        res.status(200).json({ code: 200,
            message: "密码更改成功",
        });
    } catch (error) {
        console.error("更改密码失败:", error.message);
        res.status(400).json({ code: 400,
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

        res.status(200).json({ code: 200,
            message: "令牌刷新成功",
            accesstoken: newAccessToken
        });
    } catch (error) {
        console.error("刷新令牌失败:", error.message);
        res.status(500).json({ code: 500,
            message: "令牌刷新失败"
        });
    }
}

module.exports = {
  adminLogin,
  studentLogin,
  changePassword,
  enterpriseLogin,
  logout,
  refreshAccessToken,
  client  // 导出Redis客户端实例供其他模块使用
};
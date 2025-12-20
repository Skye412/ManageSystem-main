const db = require("../modle/db"); // 新增这一行
const executeQuery = require("../utils/query");


/**
 * 发送消息
 * @param {Object} req - 请求对象，包含消息内容和发送者信息
 * @param {Object} res - 响应对象，用于返回结果
 */
async function studentSendMessage(req, res) {
    try {
        const { student_id, enterprise_id, admin_id, message } = req.body;

        // 参数校验
        if (!enterprise_id || !message) {
            return res.json({ code: 400, message: "企业ID和消息内容不能为空" });
        }
        if (!student_id && !admin_id) {
            return res.json({ code: 400, message: "必须指定接收方（学生或管理员）" });
        }

        // 插入聊天记录
        const sql = `
            INSERT INTO chat_messages 
            (student_id, enterprise_id, admin_id, message, sent_by)
            VALUES (?, ?, ?, ?, 'student')
        `;
        const result = await executeQuery(sql, 
            [student_id || null, enterprise_id, admin_id || null, message]);

        res.json({
            code: 200,
            data: {
                message_id: result.insertId,
                sent_at: new Date().toISOString()
            },
            message: "消息发送成功"
        });
        
    } catch (error) {
        console.error("发送消息失败:", error);
        res.json({code:500, message: "发送消息失败，请稍后重试" });
    }
}

/**
 * 发送消息
 * @param {Object} req - 请求对象，包含消息内容和发送者信息
 * @param {Object} res - 响应对象，用于返回结果
 */
async function enterpriseSendMessage(req, res) {
    try {
        const { student_id, enterprise_id, admin_id, message } = req.body;

        // 参数校验
        if (!enterprise_id || !message) {
            return res.json({ code: 400, message: "企业ID和消息内容不能为空" });
        }
        if (!student_id && !admin_id) {
            return res.json({ code: 400, message: "必须指定接收方（学生或管理员）" });
        }

        // 插入聊天记录
        const sql = `
            INSERT INTO chat_messages 
            (student_id, enterprise_id, admin_id, message, sent_by)
            VALUES (?, ?, ?, ?, 'enterprise')
        `;
        const result = await executeQuery(sql, 
            [student_id || null, enterprise_id, admin_id || null, message]);

        res.json({
            code: 200,
            data: {
                message_id: result.insertId,
                sent_at: new Date().toISOString()
            },
            message: "消息发送成功"
        });
        
    } catch (error) {
        console.error("发送消息失败:", error);
        res.json({code:500, message: "发送消息失败，请稍后重试" });
    }
}


async function getmessageslist(req, res) {
    try {
        const { student_id, enterprise_id, admin_id } = req.body;
        const params = [student_id, enterprise_id, admin_id].filter(p => p !== undefined);
        
        // 参数校验
        if (params.length !== 1) {
            return res.json({ code: 400, message: "必须且只能传入一个ID参数" });
        }

        const queryType = student_id ? 'student' : enterprise_id ? 'enterprise' : 'admin';
        const queryValue = params[0];

        // 构建动态SQL查询
        const sql = `
            SELECT 
                p.partner_id,
                p.partner_type,
                COALESCE(e.name, a.username, s.name) AS partner_name,
                e.contact_name,
                e.phone,
                e.email,
                a.role,
                cm.message AS last_message,
                cm.sent_at AS last_sent_at
            FROM (
                SELECT 
                    CASE
                        WHEN ${queryType}_id = ? THEN
                            CASE
                                WHEN student_id IS NOT NULL AND student_id != ? THEN student_id
                                WHEN enterprise_id IS NOT NULL AND enterprise_id != ? THEN enterprise_id 
                                WHEN admin_id IS NOT NULL AND admin_id != ? THEN admin_id
                            END
                    END AS partner_id,
                    CASE
                        WHEN student_id IS NOT NULL AND student_id != ? THEN 'student'
                        WHEN enterprise_id IS NOT NULL AND enterprise_id != ? THEN 'enterprise'
                        WHEN admin_id IS NOT NULL AND admin_id != ? THEN 'admin'
                    END AS partner_type,
                    MAX(sent_at) AS max_sent_at
                FROM chat_messages
                WHERE ${queryType}_id = ?
                GROUP BY partner_id, partner_type
                HAVING partner_id IS NOT NULL
            ) p
            LEFT JOIN chat_messages cm 
                ON cm.sent_at = p.max_sent_at
                AND (
                    (p.partner_type = 'enterprise' AND cm.enterprise_id = p.partner_id)
                    OR (p.partner_type = 'student' AND cm.student_id = p.partner_id)
                    OR (p.partner_type = 'admin' AND cm.admin_id = p.partner_id)
                )
            LEFT JOIN enterprises e ON p.partner_type = 'enterprise' AND e.id = p.partner_id
            LEFT JOIN admins a ON p.partner_type = 'admin' AND a.id = p.partner_id
            LEFT JOIN students s ON p.partner_type = 'student' AND s.id = p.partner_id
            ORDER BY last_sent_at DESC
        `;

        const results = await executeQuery(sql, [
            queryValue, queryValue, queryValue, queryValue, 
            queryValue, queryValue, queryValue, 
            queryValue
        ]);
        
        // 处理空结果
        if (!results || results.length === 0) {
            return res.json({ code: 404, message: "没有找到相关聊天记录" });
        }

        res.json({ code: 200, data: results });
    } catch (error) {
        console.error("获取消息列表失败:", error);
        res.json({ code: 500, message: "获取消息列表失败" });
    }
}

async function getChatMessages(req, res) {
    try {
        const { student_id, enterprise_id } = req.body;
        
        // 参数校验：必须传入两个有效参数
        if (!student_id || !enterprise_id) {
            return res.json({ code: 400, message: "必须同时传入学生ID和企业ID" });
        }

        // 获取双方用户信息（修正查询来源）
        const [studentInfo, enterpriseInfo] = await Promise.all([
            getStudentInfo(student_id),      // 明确从学生表查询
            getEnterpriseInfo(enterprise_id) // 明确从企业表查询
        ]);

        if (!studentInfo || !enterpriseInfo) {
            return res.json({ code: 404, message: "未找到相关用户信息" });
        }

        // 构建聊天记录查询条件
        const sql = `
            SELECT 
                cm.id,
                cm.message,
                cm.sent_by,
                cm.sent_at,
                s.name as student_name,
                e.name as enterprise_name,
                a.username as admin_name
            FROM chat_messages cm
            LEFT JOIN students s ON cm.student_id = s.id
            LEFT JOIN enterprises e ON cm.enterprise_id = e.id
            LEFT JOIN admins a ON cm.admin_id = a.id
            WHERE 
                (cm.student_id = ? AND cm.enterprise_id = ?)
                OR (cm.student_id = ? AND cm.enterprise_id = ?)
            ORDER BY cm.sent_at ASC
        `;
        
        const messages = await executeQuery(sql, [
            student_id, enterprise_id,
            enterprise_id, student_id
        ]);

        res.json({ 
            code: 200, 
            data: {
                participants: [studentInfo, enterpriseInfo],
                messages: messages || []
            }
        });

    } catch (error) {
        console.error("获取聊天记录失败:", error);
        res.json({ code: 500, message: "获取聊天记录失败" });
    }
}

// 新增专用查询函数
async function getStudentInfo(id) {
    const sql = "SELECT id, name, 'student' as type FROM students WHERE id = ?";
    const result = await executeQuery(sql, [id]);
    return result.length > 0 ? result[0] : null;
}

async function getEnterpriseInfo(id) {
    const sql = "SELECT id, name, contact_name, 'enterprise' as type FROM enterprises WHERE id = ?";
    const result = await executeQuery(sql, [id]);
    return result.length > 0 ? result[0] : null;
}

module.exports = {
    enterpriseSendMessage,
    getmessageslist,
    getChatMessages,
    studentSendMessage // 新增导出studentSendMessage方法
}
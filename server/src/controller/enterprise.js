const executeQuery = require("../utils/query");

/**
 * 根据公司名查找本公司所有职位
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<Array>} - 职位列表
 */
const getPositionsByCompanyName = async (req, res) => {
  const { companyName } = req.body;
  if (!companyName) {
    return res.json({ 
      code: 400, 
      message: "公司名不能为空"
    });
  }

  try {
    const sql = `
      SELECT p.* 
      FROM positions p
      JOIN enterprises e ON p.enterprise_id = e.id
      WHERE e.name = ?
    `;
    const results = await executeQuery(sql, [companyName]);
    if (results.length === 0) {
      return res.json({ 
        code: 404, 
        message: "未找到相关职位信息"
      });
    }
    res.json({
      code: 200,
      message: "查询成功",
      data: results,
    });
  } catch (error) {
    console.error("查询职位失败:", error);
    res.json({ 
      code: 500, 
      message: "服务器内部错误，请稍后重试",
      error: error.message 
    });
  }
};

/**
 * 添加一个本公司的职位
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<string>} - 添加成功的消息
 */
const addPosition = async (req, res) => {
  const { position_name, industry, description, salary_range, work_address, deadline, enterprise_id } = req.body;

  // 输入数据验证
  if (!position_name || !industry || !description || !salary_range || !work_address || !deadline || !enterprise_id) {
    return res.json({
      code: 400,
      message: "所有字段均为必填项，请检查输入数据"
    });
  }

  try {
    // 将日期格式化为数据库支持的格式
    const formattedDeadline = new Date(deadline).toISOString().slice(0, 19).replace('T', ' ');

    const sql = `
      INSERT INTO positions (position_name, industry, description, salary_range, work_address, deadline, enterprise_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, '待审核')
    `;
    const values = [
      position_name,
      industry,
      description,
      salary_range,
      work_address,
      formattedDeadline,
      enterprise_id
    ];
    const result = await executeQuery(sql, values);

    if (result.affectedRows === 0) {
      return res.json({ 
        code: 500, 
        message: "职位添加失败，请稍后重试"
      });
    }

    res.json({
      code: 200,
      message: '职位添加成功',
      data: null
    });
  } catch (error) {
    console.error("添加职位失败:", error);
    // 记录错误日志到文件或日志服务
    // logger.error("添加职位失败:", error);
    res.json({ 
      code: 500, 
      message: "服务器内部错误，请稍后重试"
    });
  }
};

/**
 * 根据职位ID查找职位详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<Object>} - 职位详情
 */
const getPositionDetail = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.json({ 
      code: 400, 
      message: "职位ID不能为空"
    });
  }

  try {
    const sql = `SELECT * FROM positions WHERE id = ?`;
    const results = await executeQuery(sql, [id]);
    if (results.length === 0) {
      return res.json({ 
        code: 404, 
        message: "未找到相关职位信息"
      });
    }
    res.json({
      code: 200,
      message: "查询成功",
      data: results[0],
    });
  } catch (error) {
    console.error("查询职位详情失败:", error);
    res.json({ 
      code: 500, 
      message: "服务器内部错误，请稍后重试",
      error: error.message 
    });
  }
};

/**
 * 删除职位
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<string>} - 删除成功的消息
 */
const deletePosition = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.json({ 
      code: 400, 
      message: "职位ID不能为空"
    });
  }

  try {
    const sql = `DELETE FROM positions WHERE id = ?`;
    const result = await executeQuery(sql, [id]);
    if (result.affectedRows === 0) {
      return res.json({ 
        code: 404, 
        message: "未找到相关职位信息"
      });
    }
    res.json({
      code: 200,
      message: '职位删除成功',
      data: null
    });
  } catch (error) {
    console.error("删除职位失败:", error);
    res.json({ 
      code: 500, 
      message: "服务器内部错误，请稍后重试",
      error: error.message 
    });
  }
};

/**
 * 更新职位信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<string>} - 更新成功的消息
 */
const updatePosition = async (req, res) => {
  const { id, position_name, industry, description, salary_range, work_address, deadline } = req.body;

  // 输入数据验证
  if (!id || !position_name || !industry || !description || !salary_range || !work_address || !deadline) {
    return res.json({
      code: 400,
      message: "所有字段均为必填项，请检查输入数据"
    });
  }

  try {
    // 将日期格式化为数据库支持的格式
    const formattedDeadline = new Date(deadline).toISOString().slice(0, 19).replace('T', ' ');

    const sql = `
      UPDATE positions 
      SET position_name = ?, industry = ?, description = ?, salary_range = ?, work_address = ?, deadline = ?
      WHERE id = ?
    `;
    const values = [
      position_name,
      industry,
      description,
      salary_range,
      work_address,
      formattedDeadline,
      id
    ];
    const result = await executeQuery(sql, values);

    if (result.affectedRows === 0) {
      return res.json({ 
        code: 404, 
        message: "未找到相关职位信息，更新失败"
      });
    }

    res.json({
      code: 200,
      message: '职位更新成功',
      data: null
    });
  } catch (error) {
    console.error("更新职位失败:", error);
    res.json({ 
      code: 500, 
      message: "服务器内部错误，请稍后重试",
      error: error.message 
    });
  }
};

/**
 * 根据企业ID查找投递的职位信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<Array>} - 投递的职位信息列表
 */
const getDeliveriesByEnterpriseId = async (req, res) => {
  const { enterpriseId } = req.body;
  if (!enterpriseId) {
    return res.json({ 
      code: 400, 
      message: "企业ID不能为空"
    });
  }

  try {
    const sql = `
      SELECT rd.*, s.name AS student_name, s.student_id AS student_id, p.position_name 
      FROM resume_deliveries rd
      JOIN students s ON rd.student_id = s.id
      JOIN positions p ON rd.position_id = p.id
      WHERE rd.enterprise_id = ?
    `;
    const results = await executeQuery(sql, [enterpriseId]);
    if (results.length === 0) {
      return res.json({ 
        code: 404, 
        message: "未找到相关投递信息"
      });
    }
    res.json({
      code: 200,
      message: "查询成功",
      data: results,
    });
  } catch (error) {
    console.error("查询投递信息失败:", error);
    res.json({ 
      code: 500, 
      message: "服务器内部错误，请稍后重试",
      error: error.message 
    });
  }
};

const inviteInterview = async (req, res) => {
  const { studentId } = req.body;
  if (!studentId) {
    return res.json({ code: 400, message: "学生ID不能为空" });
  }

  try {
    const sql = `UPDATE resume_deliveries SET status = '面试中' WHERE student_id = ?`;
    await executeQuery(sql, [studentId]);
    res.json({ code: 200, message: "已发送面试邀请" });
  } catch (error) {
    console.error("发送面试邀请失败:", error);
    res.json({ code: 500, message: "服务器内部错误，请稍后重试" });
  }
};

const acceptCandidate = async (req, res) => {
  const { studentId } = req.body;
  if (!studentId) {
    return res.json({ code: 400, message: "学生ID不能为空" });
  }

  try {
    const sql = `UPDATE resume_deliveries SET status = '已录用' WHERE student_id = ?`;
    await executeQuery(sql, [studentId]);
    res.json({ code: 200, message: "已录用该学生" });
  } catch (error) {
    console.error("录用操作失败:", error);
    res.json({ code: 500, message: "服务器内部错误，请稍后重试" });
  }
};

const rejectCandidate = async (req, res) => {
  const { studentId } = req.body;
  if (!studentId) {
    return res.json({ code: 400, message: "学生ID不能为空" });
  }

  try {
    const sql = `UPDATE resume_deliveries SET status = '已拒绝' WHERE student_id = ?`;
    await executeQuery(sql, [studentId]);
    res.json({ code: 200, message: "已拒绝该学生" });
  } catch (error) {
    console.error("拒绝操作失败:", error);
    res.json({ code: 500, message: "服务器内部错误，请稍后重试" });
  }
};

const markAsViewed = async (req, res) => {
  const { studentId } = req.body;
  if (!studentId) {
    return res.json({ code: 400, message: "学生ID不能为空" });
  }

  try {
    const sql = `UPDATE resume_deliveries SET status = '已查看' WHERE student_id = ?`;
    await executeQuery(sql, [studentId]);
    res.json({ code: 200, message: "已标记为已查看" });
  } catch (error) {
    console.error("标记为已查看失败:", error);
    res.json({ code: 500, message: "服务器内部错误，请稍后重试" });
  }
};

module.exports = {
  getPositionsByCompanyName,
  addPosition,
  getPositionDetail,
  deletePosition,
  updatePosition,
  getDeliveriesByEnterpriseId,
  inviteInterview,
  acceptCandidate,
  rejectCandidate,
  markAsViewed
};
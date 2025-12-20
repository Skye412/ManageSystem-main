const executeQuery = require("../utils/query");


// 新增函数：获取学生个人信息
async function getStudentInfo(req, res) {
    try {
        const { studentId } = req.body;
        if (!studentId) {
            return res.json({ code: 400, message: "学生ID不能为空" });
        }

        const sql = `
            SELECT student_id, name, gender, age, major, class, graduation_year, resume_path, status,id 
            FROM students 
            WHERE student_id = ?
        `;
        const results = await executeQuery(sql, [studentId]);

        if (results.length === 0) {
            return res.json({ code: 404, message: "学生不存在" });
        }

        res.json({
            code: 200,
            message: "查询成功",
            data: results[0],
        });
    } catch (error) {
        res.json({ code: 500, message: "查询学生信息失败" });
        throw new Error("服务器内部错误，请稍后重试");
    }
}

async function submitResume(req, res) {
  try {
    const { studentId, positionId, enterpriseId } = req.body;
    if (!studentId || !positionId || !enterpriseId) {
      return res.json({ code: 400, message: "参数不能为空" });
    }

    // 检查学生是否存在，并获取学生的 id
    const studentCheckSql = `SELECT id FROM students WHERE student_id = ?`;
    const studentCheckResult = await executeQuery(studentCheckSql, [studentId]);
    if (studentCheckResult.length === 0) {
      return res.json({ code: 404, message: "学生不存在" });
    }

    const studentIdInDb = studentCheckResult[0].id;

    // 检查职位是否存在
    const positionCheckSql = `SELECT id FROM positions WHERE id = ?`;
    const positionCheckResult = await executeQuery(positionCheckSql, [positionId]);
    if (positionCheckResult.length === 0) {
      return res.json({ code: 404, message: "职位不存在" });
    }

    // 检查企业是否存在
    const enterpriseCheckSql = `SELECT id FROM enterprises WHERE id = ?`;
    const enterpriseCheckResult = await executeQuery(enterpriseCheckSql, [enterpriseId]);
    if (enterpriseCheckResult.length === 0) {
      return res.json({ code: 404, message: "企业不存在" });
    }

    // 检查是否已经投递过该职位
    const checkDeliverySql = `SELECT id FROM resume_deliveries WHERE student_id = ? AND position_id = ?`;
    const checkDeliveryResult = await executeQuery(checkDeliverySql, [studentIdInDb, positionId]);
    if (checkDeliveryResult.length > 0) {
      return res.json({ code: 400, message: "您已经投递过该职位" });
    }

    const sql = `
      INSERT INTO resume_deliveries (student_id, position_id, enterprise_id, status)
      VALUES (?, ?, ?, '已投递')
    `;
    await executeQuery(sql, [studentIdInDb, positionId, enterpriseId]);

    res.json({
      code: 200,
      message: "简历投递成功",
    });
  } catch (error) {
    console.error("简历投递失败:", error);
    res.json({ code: 500, message: "简历投递失败，请稍后重试" });
  }
}

async function getResumeDeliveries(req, res) {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      return res.json({ code: 400, message: "学生ID不能为空" });
    }

    // 检查学生是否存在，并获取学生的 id
    const studentCheckSql = `SELECT id FROM students WHERE student_id = ?`;
    const studentCheckResult = await executeQuery(studentCheckSql, [studentId]);
    if (studentCheckResult.length === 0) {
      return res.json({ code: 404, message: "学生不存在" });
    }

    const studentIdInDb = studentCheckResult[0].id;

    // 获取简历投递信息（新增企业详细信息字段）
    const sql = `
      SELECT 
        e.id, 
        p.position_name, 
        e.name,
        e.contact_name,  
        e.address,       
        e.phone,         
        e.email,         
        rd.status, 
        rd.delivery_time
      FROM resume_deliveries rd
      JOIN positions p ON rd.position_id = p.id
      JOIN enterprises e ON rd.enterprise_id = e.id  -- 保持原有关联条件
      WHERE rd.student_id = ?
    `;
    const results = await executeQuery(sql, [studentIdInDb]);

    res.json({
      code: 200,
      message: "获取简历投递信息成功",
      data: results,
    });
  } catch (error) {
    console.error("获取简历投递信息失败:", error);
    res.json({ code: 500, message: "获取简历投递信息失败，请稍后重试" });
  }
}

module.exports = {
  getStudentInfo,
  submitResume,
  getResumeDeliveries // 新增
};
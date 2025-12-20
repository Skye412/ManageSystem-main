const executeQuery = require("../utils/query");

async function getMajorsAndClasses(req, res) {
    try {
        const sql = `
            SELECT major_name, class_name, class_advisor, class_counter 
            FROM major_classes 
            ORDER BY major_name, class_name
        `;
        const results = await executeQuery(sql);
        
        // 将结果按专业分组，并添加班主任和人数信息
        const majors = {};
        results.forEach(row => {
            if (!majors[row.major_name]) {
                majors[row.major_name] = {
                    major: row.major_name,
                    classes: [],
                };
            }
            majors[row.major_name].classes.push({
                class: row.class_name,
                advisor: row.class_advisor,
                count: row.class_counter,
            });
        });

        res.json({
            code: 200,
            message: "查询成功",
            data: Object.values(majors),
        });
    } catch (error) {
        res.json({ code: 500, message: "查询专业及班级失败" });
        throw new Error("服务器内部错误，请稍后重试");
    }
}

// 新增函数：根据班级名查找本班级所有学生
async function getStudentsByClassName(req, res) {
    try {
        const { className } = req.body;
        if (!className) {
            return res.json({ code: 400, message: "班级名不能为空" });
        }

        const sql = `
            SELECT student_id, name, gender, age, major, class, graduation_year, resume_path,status 
            FROM students 
            WHERE class = ?
            ORDER BY name
        `;
        const results = await executeQuery(sql, [className]);

        res.json({
            code: 200,
            message: "查询成功",
            data: results,
        });
    } catch (error) {
        res.json({ code: 500, message: "查询学生失败" });
        throw new Error("服务器内部错误，请稍后重试");
    }
}


/**
 * 添加专业班级信息
 * @param {Object} req - Express请求对象，包含请求体参数
 * @param {Object} res - Express响应对象，用于返回响应数据
 * @returns {Promise<void>} 无直接返回值，通过res返回JSON响应:
 *                          - 成功: 200状态码及成功信息
 *                          - 参数缺失: 400状态码及错误信息
 *                          - 数据已存在: 409状态码及冲突信息
 *                          - 服务器错误: 500状态码及错误信息
 */
async function addMajorClass(req, res) {
    try {
        // 参数校验：验证必要字段是否为空
        const { major_name, class_name, class_advisor } = req.body;
        if (!major_name || !class_name || !class_advisor) {
            return res.json({ code: 400, message: "专业名、班级名和班主任不能为空" });
        }

        // 开启事务处理，确保后续操作原子性
        await executeQuery("START TRANSACTION");

        // 重复性检查：查询已存在的专业班级记录
        const existingClass = await executeQuery(
            "SELECT * FROM major_classes WHERE major_name = ? AND class_name = ?",
            [major_name, class_name]
        );
        if (existingClass.length > 0) {
            await executeQuery("ROLLBACK");
            return res.json({ code: 409, message: "专业班级已存在" });
        }

        // 执行数据插入：新增专业班级记录并初始化计数器
        const sql = `
            INSERT INTO major_classes (major_name, class_name, class_advisor, class_counter)
            VALUES (?, ?, ?, 0)
        `;
        await executeQuery(sql, [major_name, class_name, class_advisor]);

        // 提交事务：确认所有操作成功执行
        await executeQuery("COMMIT");

        // 返回成功响应
        res.json({
            code: 200,
            message: "添加专业班级成功",
        });
    } catch (error) {
        // 异常处理：事务回滚并记录错误
        await executeQuery("ROLLBACK");
        res.json({ code: 500, message: "添加专业班级失败" });
        throw new Error("服务器内部错误，请稍后重试");
    }
}

// 新增函数：添加班级学生并更新班级人数
async function addStudentToClass(req, res) {
    try {
        const { student_id, name, gender, age, major, className, graduation_year, status } = req.body;
        if (!age) {
            age = 22;
        }
        if (!graduation_year) {
            graduation_year = 2025;
        }
        if (!status) {
            status = '未就业';
        }
        if (!student_id || !name || !gender || !major || !className) {
            return res.json({ code: 400, message: "学生ID、姓名、性别、专业和班级不能为空" });
        }

        // 开始事务
        await executeQuery("START TRANSACTION");

        // 检查学生是否已存在
        const existingStudent = await executeQuery(
            "SELECT * FROM students WHERE student_id = ?",
            [student_id]
        );
        if (existingStudent.length > 0) {
            await executeQuery("ROLLBACK");
            return res.json({ code: 409, message: "学生已存在" });
        }

        // 添加学生
        const insertStudentSql = `
            INSERT INTO students (student_id, name, gender, age, major, class, graduation_year, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await executeQuery(insertStudentSql, [student_id, name, gender, age, major, className, graduation_year, status]);

        // 更新班级人数
        const updateClassCounterSql = `
            UPDATE major_classes 
            SET class_counter = class_counter + 1 
            WHERE major_name = ? AND class_name = ?
        `;
        await executeQuery(updateClassCounterSql, [major, className]);

        // 提交事务
        await executeQuery("COMMIT");

        res.json({
            code: 200,
            message: "添加学生成功",
        });
    } catch (error) {
        // 出错时回滚事务
        await executeQuery("ROLLBACK");
        res.json({ code: 500, message: "添加学生失败" });
        console.error("添加学生失败:", error);
        throw new Error("服务器内部错误，请稍后重试");
    }
}

/**
 * 添加企业信息
 * @param {Object} req - Express请求对象，包含请求体参数
 * @param {Object} res - Express响应对象，用于返回响应数据
 * @returns {Promise<void>} 无直接返回值，通过res返回JSON响应:
 *                          - 成功: 200状态码及成功信息
 *                          - 参数缺失: 400状态码及错误信息
 *                          - 数据已存在: 409状态码及冲突信息
 *                          - 服务器错误: 500状态码及错误信息
 */
async function addEnterprise(req, res) {
    try {
        // 参数校验：验证必要字段是否为空
        const { name, contact_name, address, phone, email } = req.body;
        if (!name || !contact_name || !address || !phone || !email) {
            return res.json({ code: 400, message: "企业名称、联系人、地址、电话和邮箱不能为空" });
        }

        // 将地址数组转换为字符串
        const addressStr = Array.isArray(address) ? address.join(' ') : address;

        // 重复性检查：查询已存在的企业记录
        const existingEnterprise = await executeQuery(
            "SELECT * FROM enterprises WHERE name = ?",
            [name]
        );
        if (existingEnterprise.length > 0) {
            return res.json({ code: 409, message: "企业已存在" });
        }

        // 执行数据插入：新增企业记录
        const sql = `
            INSERT INTO enterprises (name, contact_name, address, phone, email)
            VALUES (?, ?, ?, ?, ?)
        `;
        await executeQuery(sql, [name, contact_name, addressStr, phone, email]);

        // 返回成功响应，并返回新添加的企业信息
        const newEnterprise = await executeQuery(
            "SELECT * FROM enterprises WHERE name = ?",
            [name]
        );

        res.json({
            code: 200,
            message: "添加企业成功",
            data: newEnterprise[0]
        });
    } catch (error) {
        res.json({ 
            code: 500, 
            message: "服务器内部错误，请稍后重试"
        });
    }
}

/**
 * 查询所有企业信息
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象，用于返回响应数据
 * @returns {Promise<void>} 无直接返回值，通过res返回JSON响应:
 *                          - 成功: 200状态码及企业信息列表
 *                          - 服务器错误: 500状态码及错误信息
 */
async function getAllEnterprises(req, res) {
    try {
        const sql = `SELECT * FROM enterprises ORDER BY created_at DESC`;
        const results = await executeQuery(sql);

        res.json({
            code: 200,
            message: "查询成功",
            data: results,
        });
    } catch (error) {
        res.json({ code: 500, message: "查询企业信息失败" });
        throw new Error("服务器内部错误，请稍后重试");
    }
}

/**
 * 添加职位信息
 * @param {Object} req - Express请求对象，包含请求体参数
 * @param {Object} res - Express响应对象，用于返回响应数据
 * @returns {Promise<void>} 无直接返回值，通过res返回JSON响应:
 *                          - 成功: 200状态码及成功信息
 *                          - 参数缺失: 400状态码及错误信息
 *                          - 数据已存在: 409状态码及冲突信息
 *                          - 服务器错误: 500状态码及错误信息
 */
async function addPosition(req, res) {
  try {
    // 参数校验：验证必要字段是否为空
    const { position_name, industry, description, salary_range, work_address, deadline, enterprise_name } = req.body; // 修改字段：从 enterprise_id 改为 enterprise_name
    if (!position_name || !industry || !description || !salary_range || !work_address || !deadline || !enterprise_name) {
      return res.json({ code: 400, message: "职位名称、所属行业、职位描述、薪资范围、工作地址、截至日期和所属企业不能为空" });
    }

    // 格式化 deadline 为 YYYY-MM-DD 格式
    const formattedDeadline = new Date(deadline).toISOString().split('T')[0];


    // 查询企业ID
    const enterpriseResult = await executeQuery(
      "SELECT id FROM enterprises WHERE name = ?",
      [enterprise_name]
    );
    if (enterpriseResult.length === 0) {
      await executeQuery("ROLLBACK");
      return res.json({ code: 404, message: "企业不存在" });
    }
    const enterprise_id = enterpriseResult[0].id;

    // 重复性检查：查询已存在的职位记录
    const existingPosition = await executeQuery(
      "SELECT * FROM positions WHERE position_name = ? AND industry = ?",
      [position_name, industry]
    );
    if (existingPosition.length > 0) {
      await executeQuery("ROLLBACK");
      return res.json({ code: 409, message: "职位已存在" });
    }

    // 执行数据插入：新增职位记录
    const sql = `
      INSERT INTO positions (position_name, industry, description, salary_range, work_address, deadline, enterprise_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const insertResult = await executeQuery(sql, [position_name, industry, description, salary_range, work_address, formattedDeadline, enterprise_id]);

    // 检查插入结果
    if (insertResult.affectedRows === 0) {
      await executeQuery("ROLLBACK");
      return res.json({ code: 500, message: "添加职位失败，请稍后重试" });
    }



    // 返回成功响应
    res.json({
      code: 200,
      message: "添加职位成功",
    });
  } catch (error) {
    // 异常处理：事务回滚并记录错误
    await executeQuery("ROLLBACK");
    console.error("添加职位失败:", error);
    res.json({ code: 500, message: "服务器内部错误，请稍后重试" });
  }
}

/**
 * 查询所有职位信息
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象，用于返回响应数据
 * @returns {Promise<void>} 无直接返回值，通过res返回JSON响应:
 *                          - 成功: 200状态码及职位信息列表
 *                          - 服务器错误: 500状态码及错误信息
 */

async function getPositions(req, res) {
    try {
      const sql = `
        SELECT p.*, e.name AS enterprise_name 
        FROM positions p
        LEFT JOIN enterprises e ON p.enterprise_id = e.id
        ORDER BY p.created_at DESC
      `;
      const results = await executeQuery(sql);
  
      res.json({
        code: 200,
        message: "查询成功",
        data: results,
      });
    } catch (error) {
      res.json({ code: 500, message: "查询职位信息失败" });
      throw new Error("服务器内部错误，请稍后重试");
    }
  }

async function deletePosition(req, res) {
  try {
    const { id } = req.body;
    if (!id) {
      return res.json({ code: 400, message: "职位ID不能为空" });
    }

   

    // 检查职位是否存在
    const existingPosition = await executeQuery(
      "SELECT * FROM positions WHERE id = ?",
      [id]
    );
    if (existingPosition.length === 0) {
      await executeQuery("ROLLBACK");
      return res.json({ code: 404, message: "职位不存在" });
    }

    // 执行删除操作
    const sql = "DELETE FROM positions WHERE id = ?";
    await executeQuery(sql, [id]);

    // 提交事务
    await executeQuery("COMMIT");

    res.json({
      code: 200,
      message: "删除职位成功",
    });
  } catch (error) {
 
    console.error("删除职位失败:", error);
    res.json({ code: 500, message: "服务器内部错误，请稍后重试" });
  }
}

/**
 * 获取各专业各班的学生就业状态统计数据
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象，用于返回响应数据
 * @returns {Promise<void>} 无直接返回值，通过res返回JSON响应:
 *                          - 成功: 200状态码及统计数据
 *                          - 服务器错误: 500状态码及错误信息
 */
async function getEmploymentStatistics(req, res) {
    try {
        const sql = `
            SELECT major, class, status, COUNT(*) as count
            FROM students
            GROUP BY major, class, status
            ORDER BY major, class
        `;
        const results = await executeQuery(sql);

        // 将结果按专业和班级分组
        const statistics = {};
        results.forEach(row => {
            if (!statistics[row.major]) {
                statistics[row.major] = {};
            }
            if (!statistics[row.major][row.class]) {
                statistics[row.major][row.class] = {
                    totalStudents: 0, // 新增字段，表示班级总人数
                    statusDistribution: {} // 新增字段，表示就业状态分布
                };
            }
            statistics[row.major][row.class].statusDistribution[row.status] = row.count;
            statistics[row.major][row.class].totalStudents += row.count;
        });

        // 处理班级无人的情况
        const allClasses = await executeQuery(`
            SELECT major_name, class_name
            FROM major_classes
            ORDER BY major_name, class_name
        `);
        allClasses.forEach(row => {
            if (!statistics[row.major_name] || !statistics[row.major_name][row.class_name]) {
                if (!statistics[row.major_name]) {
                    statistics[row.major_name] = {};
                }
                statistics[row.major_name][row.class_name] = {
                    totalStudents: 0,
                    statusDistribution: {}
                };
            }
        });

        res.json({
            code: 200,
            message: "查询成功",
            data: statistics,
        });
    } catch (error) {
        res.json({ code: 500, message: "查询就业统计数据失败" });
        throw new Error("服务器内部错误，请稍后重试");
    }
}

/**
 * 新增公告
 * @param {Object} req - Express请求对象，包含请求体参数
 * @param {Object} res - Express响应对象，用于返回响应数据
 * @returns {Promise<void>} 无直接返回值，通过res返回JSON响应:
 *                          - 成功: 200状态码及成功信息
 *                          - 参数缺失: 400状态码及错误信息
 *                          - 服务器错误: 500状态码及错误信息
 */
async function addNotice(req, res) {
  try {
    const { title, content, admin_id } = req.body;
    if (!title || !content || !admin_id) {
      return res.json({ code: 400, message: "标题、内容和管理员ID不能为空" });
    }

    const sql = `
      INSERT INTO notices (title, content, admin_id)
      VALUES (?, ?, ?)
    `;
    await executeQuery(sql, [title, content, admin_id]);

    res.json({
      code: 200,
      message: "新增公告成功",
    });
  } catch (error) {
    res.json({ code: 500, message: "新增公告失败" });
    console.error("新增公告失败:", error);
  }
}

/**
 * 删除公告
 * @param {Object} req - Express请求对象，包含请求体参数
 * @param {Object} res - Express响应对象，用于返回响应数据
 * @returns {Promise<void>} 无直接返回值，通过res返回JSON响应:
 *                          - 成功: 200状态码及成功信息
 *                          - 参数缺失: 400状态码及错误信息
 *                          - 服务器错误: 500状态码及错误信息
 */
async function deleteNotice(req, res) {
  try {
    const { id } = req.body;
    if (!id) {
      return res.json({ code: 400, message: "公告ID不能为空" });
    }

    const sql = "DELETE FROM notices WHERE id = ?";
    await executeQuery(sql, [id]);

    res.json({
      code: 200,
      message: "删除公告成功",
    });
  } catch (error) {
    res.json({ code: 500, message: "删除公告失败" });
    console.error("删除公告失败:", error);
  }
}

async function getNotices(req, res) {
  try {
    const sql = `SELECT * FROM notices ORDER BY created_at DESC`;
    const results = await executeQuery(sql);
    res.json({
      code: 200,
      message: "查询成功",
      data: results,
    });
  } catch (error) {
    res.json({ code: 500, message: "查询公告失败" });
    console.error("查询公告失败:", error);
  }
}

/**
 * 根据ID获取公告详情
 * @param {Object} req - Express请求对象，包含请求体参数
 * @param {Object} res - Express响应对象，用于返回响应数据
 * @returns {Promise<void>} 无直接返回值，通过res返回JSON响应:
 *                          - 成功: 200状态码及公告详情
 *                          - 参数缺失: 400状态码及错误信息
 *                          - 服务器错误: 500状态码及错误信息
 */
async function getNoticeDetail(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.json({ code: 400, message: "公告ID不能为空" });
    }

    const sql = "SELECT * FROM notices WHERE id = ?";
    const results = await executeQuery(sql, [id]);

    if (results.length === 0) {
      return res.json({ code: 404, message: "公告不存在" });
    }

    res.json({
      code: 200,
      message: "查询成功",
      data: results[0],
    });
  } catch (error) {
    res.json({ code: 500, message: "查询公告详情失败" });
    console.error("查询公告详情失败:", error);
  }
}

/**
 * 审核职位
 * @param {Object} req - Express请求对象，包含请求体参数
 * @param {Object} res - Express响应对象，用于返回响应数据
 * @returns {Promise<void>} 无直接返回值，通过res返回JSON响应:
 *                          - 成功: 200状态码及成功信息
 *                          - 参数缺失: 400状态码及错误信息
 *                          - 职位不存在: 404状态码及错误信息
 *                          - 服务器错误: 500状态码及错误信息
 */
async function reviewPosition(req, res) {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.json({ code: 400, message: "职位ID和审核状态不能为空" });
    }


    // 检查职位是否存在
    const existingPosition = await executeQuery(
      "SELECT * FROM positions WHERE id = ?",
      [id]
    );
    if (existingPosition.length === 0) {
      await executeQuery("ROLLBACK");
      return res.json({ code: 404, message: "职位不存在" });
    }

    // 更新职位状态
    const sql = "UPDATE positions SET status = ? WHERE id = ?";
    await executeQuery(sql, [status, id]);


    res.json({
      code: 200,
      message: "审核职位成功",
    });
  } catch (error) {
    // 异常处理：事务回滚并记录错误
    await executeQuery("ROLLBACK");
    console.error("审核职位失败:", error);
    res.json({ code: 500, message: "服务器内部错误，请稍后重试" });
  }
}

async function getPositionDetail(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.json({ code: 400, message: "职位ID不能为空" });
    }

    const sql = "SELECT * FROM positions WHERE id = ?";
    const results = await executeQuery(sql, [id]);

    if (results.length === 0) {
      return res.json({ code: 404, message: "职位不存在" });
    }

    res.json({
      code: 200,
      message: "查询成功",
      data: results[0],
    });
  } catch (error) {
    res.json({ code: 500, message: "查询职位详情失败" });
    console.error("查询职位详情失败:", error);
  }
}



module.exports = {
    getMajorsAndClasses,
    getStudentsByClassName,
    addMajorClass,
    addStudentToClass,
    addEnterprise,
    getAllEnterprises,
    addPosition,
    getPositions,
    deletePosition,
    getEmploymentStatistics,
    addNotice,
    deleteNotice,
    getNotices,
    getNoticeDetail,
    getPositionDetail,
    reviewPosition, // 新增审核职位功能
};
const config = require("./config.json");
const mysql = require("mysql");

const db = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
});

/**
 * 通用表创建函数
 * @param {string} tableName - 表名
 * @param {string} sql - 创建表的 SQL 语句
 * @returns {Promise<string>} - 创建成功的消息
 */
const createTable = (tableName, sql) => {
  return new Promise((resolve, reject) => {
    db.query(sql, (error) => {
      if (error) {
        console.error(`创建 ${tableName} 失败:`, error.message); 
        reject(error);
      } else {
        console.log(`创建 ${tableName} 成功`); 
        resolve(`创建${tableName}`);
      }
    });
  });
};

/**
 * 创建企业表
 */
const initEnterpriseTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS enterprises (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      password VARCHAR(255) DEFAULT '123456',
      contact_name VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `;
  return createTable("企业表", sql);
};

/**
 * 创建学生表
 */
const initStudentTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id CHAR(11) NOT NULL UNIQUE,
      password VARCHAR(255) DEFAULT '123456',
      name VARCHAR(255) NOT NULL,
      gender ENUM('男', '女') NOT NULL,
      avatar VARCHAR(255) DEFAULT NULL,
      age VARCHAR(255) DEFAULT '22',
      major VARCHAR(255) NOT NULL,
      class VARCHAR(255) NOT NULL,
      graduation_year YEAR DEFAULT '2025',
      resume_path VARCHAR(255) DEFAULT NULL,
      status ENUM('就业', '升学', '未就业', '即将就业') DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `;
  return createTable("学生表", sql);
};
/**
 * 创建管理员表
 */
const initAdminTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('superadmin', 'admin') NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `;
  return createTable("管理员表", sql);
};

/**
 * 创建专业班级表
 */
const initMajorClassTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS major_classes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      major_name VARCHAR(255) NOT NULL,
      class_name VARCHAR(255) NOT NULL,
      class_advisor VARCHAR(255) NOT NULL,
      class_counter INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_major_class (major_name, class_name)
    ) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `;
  return createTable("专业班级表", sql);
};

/**
 * 创建职位信息表
 */
const initPositionTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS positions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      position_name VARCHAR(255) NOT NULL,
      industry ENUM('制造业', '信息技术与互联网', '金融', '教育', '医疗健康', '建筑与工程', '能源与资源', '服务业') NOT NULL,
      description TEXT NOT NULL,
      salary_range VARCHAR(255) NOT NULL, 
      work_address VARCHAR(255) NOT NULL,  
      applicants_count INT DEFAULT 0,  
      deadline DATE NOT NULL, 
      enterprise_id INT NOT NULL,
      status ENUM('待审核', '已上架', '已下架') DEFAULT '待审核',  
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE 
    ) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `;
  return createTable("职位信息表", sql);
};

/**
 * 创建通知公告表
 */
const initNoticeTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS notices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      admin_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    ) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `;
  return createTable("通知公告表", sql);
};

/**
 * 创建简历投递表
 */
const initResumeDeliveryTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS resume_deliveries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      position_id INT NOT NULL,
      enterprise_id INT NOT NULL,
      status ENUM('已投递', '已查看', '面试中', '已录用', '已拒绝') DEFAULT '已投递',
      delivery_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
      FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE
    ) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `;
  return createTable("简历投递表", sql);
};


/**
 * 创建聊天信息表
 */
const initChatMessageTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT DEFAULT NULL,
      enterprise_id INT DEFAULT NULL,
      admin_id INT DEFAULT NULL,
      message TEXT NOT NULL,
      sent_by ENUM('student', 'enterprise', 'admin') NOT NULL,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    ) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `;
  return createTable("聊天信息表", sql);
};

db.query("select 1", async (error) => {
  if (error) {
    console.log("MySQL 连接失败", error.message);
    process.exit(1);
  }
  console.log("MySQL 连接成功");
  try {
    await initEnterpriseTable(); 
    await initAdminTable();
    await initStudentTable();
    await initMajorClassTable();
    await initPositionTable();
    await initNoticeTable();
    await initResumeDeliveryTable();
    await initChatMessageTable();  // 新增：确保聊天信息表在数据库初始化时被创建
    console.log("所有表创建完成");
  } catch (error) {
    console.error("表创建失败", error);
    process.exit(1);
  }
});

module.exports = db;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const executeQuery = require('../utils/query');

// 定义存储路径和文件名生成函数
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const studentId = req.body.studentId; // 获取学号
        if (!studentId) {
            return cb(new Error('学号未提供'));
        }
        const dir = path.join(__dirname, '../../files/resumes', studentId); // 创建以学号为名的文件夹路径

        // 检查文件夹是否存在，如果不存在则创建
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const studentName = req.body.studentName; // 获取学生姓名
        if (!studentName) {
            return cb(new Error('学生姓名未提供'));
        }
        // 使用学生姓名和时间戳生成文件名
        const timestamp = Date.now();
        const fileName = `${studentName}_${timestamp}.pdf`;
        cb(null, fileName);
    }
});

// 文件过滤函数，只允许上传PDF文件
function fileFilter(req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
        return cb(new Error('只允许上传PDF文件'), false);
    }
    cb(null, true);
}

// 创建 multer 实例
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 限制文件大小为10MB
    fileFilter: fileFilter
});

/**
 * 上传简历
 * @param {Object} req - 请求对象，包含用户提交的简历文件、学号和姓名
 * @param {Object} res - 响应对象，用于向用户发送上传结果
 * @returns {Promise<void>} - 异步函数，无返回值
 */
const uploadResume = (req, res) => {
    upload.single('resume')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: '未上传文件' });
        }

        // 格式化文件路径
        const formattedPath = req.file.path
            .replace(/\\/g, '/') // 将反斜杠替换为斜杠
            .replace(/.*\/files/, 'api/files'); // 去掉前缀，替换为api/files

        // 将格式化后的路径存入数据库
        const studentId = req.body.studentId;
        const sql = 'UPDATE students SET resume_path = ? WHERE student_id = ?';
        try {
            await executeQuery(sql, [formattedPath, studentId]);
            res.status(200).json({ message: '简历上传成功', filePath: formattedPath });
        } catch (error) {
            console.error('数据库更新失败:', error);
            res.status(500).json({ message: '数据库更新失败' });
        }
    });
};

module.exports = {
    uploadResume
};
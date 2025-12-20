<template>
    <div class="student-datamanage">
        <el-card class="student-info-card" shadow="hover">
            <template #header>
                <div class="card-header">
                    <span class="header-title">个人信息</span>
                </div>
            </template>
            <el-skeleton :loading="loading" animated>
                <template #template>
                    <el-skeleton-item variant="text" style="width: 30%" />
                    <el-skeleton-item variant="text" style="width: 50%" />
                    <el-skeleton-item variant="text" style="width: 40%" />
                    <el-skeleton-item variant="text" style="width: 60%" />
                </template>
                <template #default>
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="学号" label-class-name="description-label">
                            <el-icon><User /></el-icon>
                            {{ studentInfo.student_id }}
                        </el-descriptions-item>
                        <el-descriptions-item label="姓名">
                            <el-icon><Edit /></el-icon>
                            {{ studentInfo.name }}
                        </el-descriptions-item>
                        <el-descriptions-item label="性别">
                            <el-icon><Male v-if="studentInfo.gender === '男'" /><Female v-else /></el-icon>
                            {{ studentInfo.gender }}
                        </el-descriptions-item>
                        <el-descriptions-item label="年龄">
                            <el-icon><Calendar /></el-icon>
                            {{ studentInfo.age }}
                        </el-descriptions-item>
                        <el-descriptions-item label="专业">
                            <el-icon><School /></el-icon>
                            {{ studentInfo.major }}
                        </el-descriptions-item>
                        <el-descriptions-item label="班级">
                            <el-icon><OfficeBuilding /></el-icon>
                            {{ studentInfo.class }}
                        </el-descriptions-item>
                        <el-descriptions-item label="毕业年份">
                            <el-icon><Clock /></el-icon>
                            {{ studentInfo.graduation_year }}
                        </el-descriptions-item>
                        <el-descriptions-item label="简历">
                            <el-icon><Document /></el-icon>
                            <el-link type="primary" :href="formatResumePath(studentInfo.resume_path)" target="_blank">查看简历</el-link>
                        </el-descriptions-item>
                        <el-descriptions-item label="就业状态">
                            <el-tag :type="getStatusTagType(studentInfo.status)">
                                {{ studentInfo.status }}
                            </el-tag>
                        </el-descriptions-item>
                    </el-descriptions>
                    <el-upload
                        ref="uploadRef"
                        class="upload-resume"
                        action="/api/file/uploadResume"
                        :data="{ studentId: student.studentInfo.studentid, studentName: student.studentInfo.studentName}"
                        :on-success="handleUploadSuccess"
                        :on-error="handleUploadError"
                        :before-upload="beforeUpload"
                        :limit="1"
                        :show-file-list="false"
                        name="resume"
                    >
                        <el-button type="primary" icon="Upload">上传简历</el-button>
                    </el-upload>
                </template>
            </el-skeleton>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import studentApi from '../../Api/studentApi';
import { studentStore } from '@/stores/counter';
const student = studentStore();
import { ElMessage } from 'element-plus';
import {
    User,
    Edit,
    Male,
    Female,
    Calendar,
    School,
    OfficeBuilding,
    Clock,
    Document,
    Upload
} from '@element-plus/icons-vue';

const studentInfo = ref({});
const loading = ref(true);
const uploadRef = ref(null); // 新增：上传组件的引用

const getStatusTagType = (status) => {
    switch (status) {
        case '已就业': return 'success';
        case '未就业': return 'warning';
        case '实习中': return 'info';
        default: return '';
    }
};

// 修改：格式化简历路径，去除api并加上http://127.0.0.1:3000/
const formatResumePath = (resumePath) => {
    if (!resumePath) return '';
    return `http://127.0.0.1:3000/${resumePath.replace('api/', '')}`;
};

const fetchStudentInfo = async () => {
    const student = studentStore();
    try {
        const res = await studentApi.getStudentInfo({ studentId: student.studentInfo.studentid });
        if (res.data.code === 200) {
            studentInfo.value = res.data.data;
        } else {
            ElMessage.error('获取学生信息失败');
        }
    } catch (error) {
        ElMessage.error('获取学生信息失败，请稍后重试');
    } finally {
        loading.value = false;
    }
};

const handleUploadSuccess = (response, file) => {
    if (response.message === '简历上传成功') {
        ElMessage.success('简历上传成功');
        fetchStudentInfo();
        // 新增：重置上传组件状态
        if (uploadRef.value) {
            uploadRef.value.clearFiles();
        }
    } else {
        ElMessage.error(response.message || '简历上传失败');
    }
};

const handleUploadError = (error, file) => {
    ElMessage.error('简历上传失败，请稍后重试');
};

const beforeUpload = (file) => {
    const isPDF = file.type === 'application/pdf';
    if (!isPDF) {
        ElMessage.error('只能上传PDF文件');
    }
    return isPDF;
};

onMounted(() => {
    fetchStudentInfo();
});
</script>

<style scoped>
.student-datamanage {
    padding: 30px;
}

.student-info-card {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    border-radius: 8px;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.header-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
}

:deep(.description-label) {
    font-weight: 500;
    color: #606266;
}

.el-descriptions {
    margin-top: 20px;
}

.el-descriptions-item {
    padding: 12px 16px;
}

.el-icon {
    margin-right: 8px;
    color: #409EFF;
}

.el-tag {
    margin-left: 8px;
}

.upload-resume {
    margin-top: 20px;
}
</style>
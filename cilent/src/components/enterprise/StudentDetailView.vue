<template>
  <div class="student-detail-view">
    <el-card class="student-info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">学生详细信息</span>
          <el-button type="primary" @click="goBack">返回</el-button>
        </div>
      </template>
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
        <el-descriptions-item label="操作">
          <el-button type="primary" @click="inviteInterview">邀请面试</el-button>
          <el-button type="success" @click="acceptCandidate">录用</el-button>
          <el-button type="danger" @click="rejectCandidate">拒绝</el-button>
          <el-button type="warning" @click="goToChat">交流</el-button>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import studentApi from '../../Api/studentApi';
import enterpriseApi from '../../Api/enterpriseApi';
import {
  User,
  Edit,
  Male,
  Female,
  Calendar,
  School,
  OfficeBuilding,
  Clock,
  Document
} from '@element-plus/icons-vue';

const router = useRouter();
const studentInfo = ref({});

const getStatusTagType = (status) => {
  switch (status) {
    case '已就业': return 'success';
    case '未就业': return 'warning';
    case '实习中': return 'info';
    default: return '';
  }
};

const formatResumePath = (resumePath) => {
  if (!resumePath) return '';
  return `http://127.0.0.1:3000/${resumePath.replace('api/', '')}`;
};

const fetchStudentInfo = async (studentId) => {
  try {
    const res = await enterpriseApi.getStudentInfo({ studentId });
    if (res.data.code === 200) {
      studentInfo.value = res.data.data;
      console.log(studentInfo.value);
    } else {
      ElMessage.error('获取学生信息失败');
    }
  } catch (error) {
    ElMessage.error('获取学生信息失败，请稍后重试');
  }
};

const goBack = () => {
  router.go(-1);
};

const inviteInterview = async () => {
  try {
    console.log(studentInfo.value);
    const res = await enterpriseApi.inviteInterview({ studentId: studentInfo.value.id });
    if (res.data.code === 200) {
      ElMessage.success('已发送面试邀请');
    } else {
      ElMessage.error('发送面试邀请失败');
    }
  } catch (error) {
    ElMessage.error('发送面试邀请失败，请稍后重试');
  }
};

const acceptCandidate = async () => {
  try {
    const res = await enterpriseApi.acceptCandidate({ studentId: studentInfo.value.id });
    if (res.data.code === 200) {
      ElMessage.success('已录用该学生');
    } else {
      ElMessage.error('录用操作失败');
    }
  } catch (error) {
    ElMessage.error('录用操作失败，请稍后重试');
  }
};

const rejectCandidate = async () => {
  try {
    const res = await enterpriseApi.rejectCandidate({ studentId: studentInfo.value.id });
    if (res.data.code === 200) {
      ElMessage.success('已拒绝该学生');
    } else {
      ElMessage.error('拒绝操作失败');
    }
  } catch (error) {
    ElMessage.error('拒绝操作失败，请稍后重试');
  }
};

const goToChat = () => {
  router.push({
    name: 'enterpriseChat',
    query: {
      partner_id: studentInfo.value.id,
      partner_type: 'student'
    }
  });
};

onMounted(() => {
  const studentId = router.currentRoute.value.params.studentId;
  fetchStudentInfo(studentId);
  enterpriseApi.markAsViewed({ studentId:studentInfo.value.id });
});
</script>

<style scoped>
.student-detail-view {
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
</style>
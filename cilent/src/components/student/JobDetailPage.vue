<template>
  <div class="job-detail-container">
    <el-button type="primary" @click="goBack" class="back-btn">返回</el-button>
    <h1 class="job-title">{{ job.position_name }}</h1>
    <div class="job-content">
      <p><strong>行业:</strong> {{ job.industry }}</p>
      <p><strong>企业:</strong> {{ job.enterprise_name }}</p>
      <p><strong>薪资:</strong> {{ job.salary_range }}</p>
      <p><strong>工作地点:</strong> {{ job.work_address }}</p>
      <p><strong>截止日期:</strong> {{ formatDate(job.deadline) }}</p>
      <p><strong>职位描述:</strong> {{ job.description }}</p>
    </div>
    <el-button type="primary" @click="submitResume">投递简历</el-button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import studentApi from '../../Api/studentApi';
import ManageApi from '../../Api/manageApi';
import { studentStore } from '@/stores/counter';

const route = useRoute();
const router = useRouter();
const job = ref({
  position_name: '',
  industry: '',
  enterprise_name: '',
  salary_range: '',
  work_address: '',
  deadline: '',
  description: ''
});


const fetchJobDetail = async () => {
  try {
    const response = await studentApi.getPositionDetail(route.params.id);
    job.value = response.data.data;
  } catch (error) {
    console.error('获取职位详情失败:', error);
  }
};

const goBack = () => {
  router.go(-1);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const submitResume = async () => {
  try {
    const student = studentStore();
    const response = await studentApi.submitResume({
      studentId: student.studentInfo.studentid, // 修改为使用 students 表中的 id
      positionId: route.params.id,
      enterpriseId: job.value.enterprise_id
    });
    if (response.data.code === 200) {
      ElMessage.success('简历投递成功');
    } else {
      ElMessage.error(response.data.message);
    }
  } catch (error) {
    console.error('简历投递失败:', error);
    ElMessage.error('简历投递失败，请稍后重试');
  }
};

onMounted(() => {
  fetchJobDetail();
});
</script>

<style scoped>
.job-detail-container {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.job-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 20px;
}

.job-content {
  font-size: 16px;
  color: #606266;
}

.job-content p {
  margin: 8px 0;
}

.back-btn {
  margin-bottom: 20px;
}
</style>
<template>
  <div class="notice-container">
    <h1 class="notice-title">通知公告</h1>
    <el-table :data="notices" style="width: 100%" border class="notice-table">
      <el-table-column prop="title" label="标题" width="180" show-overflow-tooltip></el-table-column>
      <el-table-column prop="content" label="内容" show-overflow-tooltip></el-table-column>
      <el-table-column prop="created_at" label="发布时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewNotice(scope.row)" class="view-btn">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <h1 class="resume-title">我的简历投递</h1>
    <el-table 
      :data="resumeDeliveries" 
      style="width: 100%" 
      border 
      class="resume-table"
      @row-click="row => goToChat(row)">
      <el-table-column prop="position_name" label="职位名称" width="180"></el-table-column>
      <el-table-column prop="name" label="企业名称" width="180"></el-table-column>
      <el-table-column prop="status" label="投递状态" width="180"></el-table-column>
      <el-table-column prop="delivery_time" label="投递时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.delivery_time) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ManageApi from '../../Api/manageApi';
import studentApi from '../../Api/studentApi'; // 新增
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { studentStore } from '@/stores/counter';

const notices = ref([]);
const resumeDeliveries = ref([]); // 新增
const router = useRouter();

// 日期格式化函数
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 查看公告详情
const viewNotice = (notice) => {
  router.push({ name: 'studentnoticeDetail', params: { id: notice.id } });
};

// 获取公告列表
const fetchNotices = async () => {
  try {
    const response = await studentApi.getNotices();
    notices.value = Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    console.error('获取公告列表失败:', error);
  }
};

// 新增：获取简历投递信息
const fetchResumeDeliveries = async () => {
  try {
    const student = studentStore();
    const response = await studentApi.getResumeDeliveries({ studentId: student.studentInfo.studentid }); // 假设学生ID为123456
    resumeDeliveries.value = Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    console.error('获取简历投递信息失败:', error);
  }
};

const goToChat = (item) => {
    router.push({
        path: '/student/chat',
        query: {
            partner_type: 'enterprise',
            partner_id: String(item.id)  // 添加String转换
        }
    });
}

onMounted(() => {
  fetchNotices();
  fetchResumeDeliveries(); // 新增
});
</script>

<style scoped>
.notice-container {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.notice-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 20px;
}

.resume-title {
  font-size: 24px;
  color: #303133;
  margin-top: 40px;
  margin-bottom: 20px;
}

.notice-table {
  animation: fadeInUp 0.5s;
}

.resume-table {
  animation: fadeInUp 0.5s;
}

.view-btn {
  margin-right: 10px;
  transition: all 0.3s ease;
}

.view-btn:hover {
  transform: scale(1.1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
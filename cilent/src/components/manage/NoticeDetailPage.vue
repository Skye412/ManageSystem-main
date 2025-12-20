<template>
  <div class="notice-detail-container">
    <el-button type="primary" @click="goBack" class="back-btn">返回</el-button>
    <h1 class="notice-title">{{ notice.title }}</h1>
    <div class="notice-content">{{ notice.content }}</div>
    <div class="notice-date">发布时间: {{ notice.created_at }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ManageApi from '../../Api/manageApi';
import dayjs from 'dayjs';
import { manageStore, studentStore, enterpriseStore } from '../stores/counter';

const route = useRoute();
const router = useRouter();
const notice = ref({
  title: '',
  content: '',
  created_at: '',
});

const fetchNoticeDetail = async () => {
  try {
    const response = await ManageApi.getNoticeDetail(route.params.id);
    notice.value = {
      ...response.data.data,
      created_at: dayjs(response.data.data.created_at).format('YYYY-MM-DD HH:mm:ss'),
    };
  } catch (error) {
    console.error('获取公告详情失败:', error);
  }
};

const goBack = () => {
  router.go(-1);
};

onMounted(() => {
  fetchNoticeDetail();
});
</script>

<style scoped>
.notice-detail-container {
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

.notice-content {
  font-size: 16px;
  color: #606266;
  margin-bottom: 20px;
}

.notice-date {
  font-size: 14px;
  color: #909399;
}

.back-btn {
  margin-bottom: 20px;
}
</style>
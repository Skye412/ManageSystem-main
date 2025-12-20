<template>
  <div class="position-detail-container">
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>{{ position.position_name }}</span>
          <div>
            <el-button type="primary" @click="goBack">返回</el-button>
            <el-button type="primary" @click="handleEditPosition">修改</el-button>
          </div>
        </div>
      </template>
      <el-descriptions :column="1" border class="detail-descriptions">
        <el-descriptions-item label="行业">{{ position.industry }}</el-descriptions-item>
        <el-descriptions-item label="职位描述">{{ position.description }}</el-descriptions-item>
        <el-descriptions-item label="薪资范围">{{ position.salary_range }}</el-descriptions-item>
        <el-descriptions-item label="工作地点">{{ position.work_address }}</el-descriptions-item>
        <el-descriptions-item label="截止日期">{{ formatDate(position.deadline) }}</el-descriptions-item>
        <el-descriptions-item label="投递人数">{{ position.applicants_count }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import enterpriseApi from '@/Api/enterpriseApi'

const route = useRoute()
const router = useRouter()
const position = ref({})

const fetchPositionDetail = async () => {
  const res = await enterpriseApi.getPositionDetail({ id: route.params.id })
  if (res.data.code === 200) {
    position.value = res.data.data
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const goBack = () => {
  router.push('/enterprise/position')
}

const handleEditPosition = () => {
  router.push(`/enterprise/editPosition/${route.params.id}`)
}

onMounted(() => {
  fetchPositionDetail()
})
</script>

<style scoped>
.position-detail-container {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.detail-card {
  max-width: 800px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-descriptions {
  margin-top: 20px;
}
</style>
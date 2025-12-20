<template>
  <div class="position-container">
    <div class="button-container">
      <el-button type="primary" @click="handleAddPosition">添加职位</el-button>
    </div>
    <el-table :data="positions" style="width: 100%" @row-click="handleRowClick" class="position-table">
      <el-table-column prop="position_name" label="职位名称" :show-overflow-tooltip="true" />
      <el-table-column prop="industry" label="行业" :show-overflow-tooltip="true" />
      <el-table-column prop="description" label="职位描述" :show-overflow-tooltip="true" />
      <el-table-column prop="salary_range" label="薪资范围" :show-overflow-tooltip="true" />
      <el-table-column prop="work_address" label="工作地点" :show-overflow-tooltip="true" />
      <el-table-column prop="deadline" label="截止日期" :formatter="formatDate" />
      <el-table-column prop="applicants_count" label="投递人数" :show-overflow-tooltip="true" />
      <el-table-column prop="status" label="职位状态" :show-overflow-tooltip="true" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="danger" @click.stop="handleDeletePosition(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import enterpriseApi from '../../Api/enterpriseApi';
import { enterpriseStore } from '@/stores/counter';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const enterpriseS = enterpriseStore();
const positions = ref([]);
const router = useRouter();

const getEnterpriseInfo = async () => {
    const res = await enterpriseApi.getEnterpriseInfo({companyName: enterpriseS.enterpriseInfo.enterpriseName});
    if (res.data.code === 200) {
        positions.value = res.data.data;
        console.log(positions.value);
    }
};

const handleRowClick = (row) => {
  router.push(`/enterprise/positionDetail/${row.id}`)
}

const handleAddPosition = () => {
  router.push('/enterprise/addPosition')
}

const handleDeletePosition = async (id) => {
  const res = await enterpriseApi.deletePosition({ id });
  if (res.data.code === 200) {
    ElMessage.success('删除成功');
    await getEnterpriseInfo();
  } else {
    ElMessage.error('删除失败');
  }
}

// 日期格式化方法
const formatDate = (row, column, cellValue) => {
  const date = new Date(cellValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

onMounted(async () => {
    await getEnterpriseInfo();
});
</script>

<style scoped>
.position-container {
  padding: 20px;
}

.button-container {
  margin-bottom: 20px;
}

.position-table {
  margin-top: 20px;
}
</style>
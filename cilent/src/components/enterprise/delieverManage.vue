<template>
  <div class="delieverManage">
    <el-table :data="deliveries" style="width: 100%">
      <el-table-column prop="student_name" label="学生姓名">
        <template #default="scope">
          <el-link type="primary" @click="viewStudentDetail(scope.row.student_id)">{{ scope.row.student_name }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="position_name" label="职位名称" />
      <el-table-column prop="status" label="投递状态" />
      <el-table-column prop="delivery_time" label="投递时间" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import enterpriseApi from '../../Api/enterpriseApi';
import { enterpriseStore } from '../../stores/counter';

const router = useRouter();
const store = enterpriseStore();
const deliveries = ref([]);

const viewStudentDetail = (studentId) => {
  router.push({ name: 'StudentDetail', params: { studentId } });
};

onMounted(async () => {
  const response = await enterpriseApi.getDeliveriesByEnterpriseId({ enterpriseId: store.enterpriseInfo.enterpriseId });
  if (response.data.code === 200) {
    deliveries.value = response.data.data;
  }
});
</script>

<style scoped>
.delieverManage {
  width: 100%;
  height: 100%;
}
</style>
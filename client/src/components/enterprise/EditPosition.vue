<template>
  <div class="edit-position-container">
    <el-form :model="form" label-width="120px" class="form-container">
      <el-form-item label="职位名称">
        <el-input v-model="form.position_name" />
      </el-form-item>
      <el-form-item label="行业">
        <el-select v-model="form.industry" placeholder="请选择行业">
          <el-option label="制造业" value="制造业" />
          <el-option label="信息技术与互联网" value="信息技术与互联网" />
          <el-option label="金融" value="金融" />
          <el-option label="教育" value="教育" />
          <el-option label="医疗健康" value="医疗健康" />
          <el-option label="建筑与工程" value="建筑与工程" />
          <el-option label="能源与资源" value="能源与资源" />
          <el-option label="服务业" value="服务业" />
        </el-select>
      </el-form-item>
      <el-form-item label="职位描述">
        <el-input v-model="form.description" type="textarea" />
      </el-form-item>
      <el-form-item label="薪资范围">
        <el-input v-model="form.salary_range" />
      </el-form-item>
      <el-form-item label="工作地点">
        <el-input v-model="form.work_address" />
      </el-form-item>
      <el-form-item label="截止日期">
        <el-date-picker v-model="form.deadline" type="datetime" placeholder="选择日期和时间" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import enterpriseApi from '@/Api/enterpriseApi'

const route = useRoute()
const router = useRouter()
const form = ref({
  id: route.params.id,
  position_name: '',
  industry: '',
  description: '',
  salary_range: '',
  work_address: '',
  deadline: ''
})

const fetchPositionDetail = async () => {
  const res = await enterpriseApi.getPositionDetail({ id: route.params.id })
  if (res.data.code === 200) {
    form.value = res.data.data
  }
}

const handleSubmit = async () => {
  console.log(form.value)
  const res = await enterpriseApi.updatePosition(form.value)
  if (res.data.code === 200) {
    ElMessage.success('修改成功')
    router.push('/enterprise/position')
  } else {
    ElMessage.error('修改失败')
  }
}

const handleCancel = () => {
  router.push('/enterprise/position')
}

onMounted(() => {
  fetchPositionDetail()
})
</script>

<style scoped>
.edit-position-container {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.form-container {
  max-width: 800px;
  width: 100%;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
<template>
  <div class="add-position-container">
    <el-form :model="form" label-width="120px">
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import enterpriseApi from '@/Api/enterpriseApi'
import { enterpriseStore } from '@/stores/counter'

const router = useRouter()
const enterpriseS = enterpriseStore()

const form = ref({
  position_name: '',
  industry: '',
  description: '',
  salary_range: '',
  work_address: '',
  deadline: '',
  enterprise_id: enterpriseS.enterpriseInfo.enterpriseId
})

const handleSubmit = async () => {
  console.log(form.value)
  try {
    const res = await enterpriseApi.addPosition(form.value)
    if (res && res.data && res.data.code === 200) {
      ElMessage.success('添加成功')
      router.push('/enterprise/position')
    } else {
      ElMessage.error('添加失败')
    }
  } catch (error) {
    console.error("添加职位失败:", error)
    ElMessage.error('添加职位时发生错误，请稍后重试')
  }
}

const handleCancel = () => {
  router.push('/enterprise/position')
}
</script>

<style scoped>
.add-position-container {
  padding: 20px;
}
</style>
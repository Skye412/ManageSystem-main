<template>
  <el-container style="height: 100vh; overflow: hidden;">
    <el-header style="padding: 20px; background-color: #ffffff; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);">
      <!-- 筛选条件 -->
      <el-select
        v-model="selectedIndustry"
        placeholder="请选择行业"
        @change="filterPositions"
        style="width: 100%;"
      >
        <el-option
          v-for="industry in industries"
          :key="industry"
          :label="industry"
          :value="industry"
        />
      </el-select>
    </el-header>
    <el-main style="padding: 20px; height: calc(100vh - 140px); overflow-y: auto;">
      <!-- 职位卡片展示 -->
      <el-row :gutter="20">
        <el-col
          v-for="position in filteredPositions"
          :key="position.id"
          :span="8"
          style="margin-bottom: 20px;"
        >
          <el-card class="position-card">
            <div class="card-header">
              <span class="position-name">{{ position.position_name }}</span>
              <el-tag type="info">{{ position.industry }}</el-tag>
            </div>
            <div class="card-content">
              <p><strong>企业:</strong> {{ position.enterprise_name }}</p>
              <p><strong>薪资:</strong> {{ position.salary_range }}</p>
              <p><strong>工作地点:</strong> {{ position.work_address }}</p>
              <p><strong>截止日期:</strong> {{ formatDate(position.deadline) }}</p>
            </div>
            <div class="card-footer">
              <el-button type="primary" @click="viewDetails(position.id)">查看详情</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import ManageApi from '@/Api/manageApi'
import studentApi from '@/Api/studentApi'
import { useRouter } from 'vue-router'

const router = useRouter()

// 职位列表
const positions = ref([])
// 筛选后的职位列表
const filteredPositions = ref([])
// 选择的行业
const selectedIndustry = ref('')
// 行业列表
const industries = ref([
  '全部行业',
  '制造业',
  '信息技术与互联网',
  '金融',
  '教育',
  '医疗健康',
  '建筑与工程',
  '能源与资源',
  '服务业'
])

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// 获取职位信息
const getPositions = async () => {
  try {
    const res = await studentApi.getPositions();
    console.log(res.data.data) ;
    if (res.data.code === 200) {
      positions.value = res.data.data.filter(p => p.status !== '待审核'); // 过滤掉状态为“待审核”的职位
      filteredPositions.value = positions.value // 默认显示全部职位
    } else {
      ElMessage.error('获取职位信息失败')
    }
  } catch (error) {
    ElMessage.error('服务器错误，请稍后重试')
  }
}

// 根据行业筛选职位
const filterPositions = () => {
  if (selectedIndustry.value && selectedIndustry.value !== '全部行业') {
    filteredPositions.value = positions.value.filter(
      position => position.industry === selectedIndustry.value
    )
  } else {
    filteredPositions.value = positions.value
  }
}

// 查看职位详情
const viewDetails = (id) => {
  router.push({ name: 'jobDetail', params: { id } });
};

onMounted(() => {
  getPositions()
})
</script>

<style scoped>
.el-container {
  height: 100vh;
  width: 100%;
  overflow: hidden; /* 防止容器溢出 */
}

.position-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box; /* 确保内边距不影响布局 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.position-name {
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-content {
  flex: 1;
  overflow: hidden; /* 防止内容溢出 */
}

.card-content p {
  margin: 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  text-align: right;
  margin-top: 15px;
}
</style>
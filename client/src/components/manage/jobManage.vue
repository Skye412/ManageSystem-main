<template>
  <div class="job-management">
    <h1>职位信息管理</h1>

    <!-- 行业分类筛选与新增职位按钮 -->
    <div class="header-actions">
      <el-select v-model="selectedIndustry" placeholder="请选择行业" @change="filterPositionsByIndustry">
        <el-option label="全部" value="" />
        <el-option v-for="industry in industries" :key="industry" :label="industry" :value="industry" />
      </el-select>
      <el-button type="primary" class="add-position-btn" @click="dialogVisible = true">新增职位</el-button>
    </div>

    <!-- 职位信息表格 -->
    <el-table :data="filteredPositions" style="width: 100%; margin-top: 20px; margin-bottom: 20px">
      <el-table-column prop="position_name" label="职位名称" width="120" show-overflow-tooltip />
      <el-table-column prop="industry" label="所属行业" width="100" show-overflow-tooltip />
      <el-table-column prop="description" label="职位描述" width="200" show-overflow-tooltip />
      <el-table-column prop="enterprise_name" label="所属企业" width="150" show-overflow-tooltip />
      <el-table-column prop="salary_range" label="薪资范围" width="100" show-overflow-tooltip />
      <el-table-column prop="work_address" label="工作地址" width="150" show-overflow-tooltip />
      <el-table-column prop="applicants_count" label="已投递人数" width="100" />
      <el-table-column prop="deadline" label="截至日期" width="120" />
      <el-table-column prop="status" label="职位状态" width="100" show-overflow-tooltip />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleViewDetails(scope.row)">查看详情</el-button>
          <el-button type="danger" size="small" @click="handleDeletePosition(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增职位对话框 -->
    <el-dialog v-model="dialogVisible" title="新增职位" width="30%">
      <el-form :model="newPositionForm" label-width="100px">
        <el-form-item label="职位名称" prop="position_name">
          <el-input v-model="newPositionForm.position_name" />
        </el-form-item>
        <el-form-item label="所属行业" prop="industry">
          <el-select v-model="newPositionForm.industry" placeholder="请选择行业">
            <el-option v-for="industry in industries" :key="industry" :label="industry" :value="industry" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属企业" prop="enterprise_name">
          <el-select v-model="newPositionForm.enterprise_name" placeholder="请选择企业">
            <el-option v-for="enterprise in enterprises" :key="enterprise.id" :label="enterprise.name" :value="enterprise.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="职位描述" prop="description">
          <el-input v-model="newPositionForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="薪资范围" prop="salary_range">
          <el-input v-model="newPositionForm.salary_range" />
        </el-form-item>
        <el-form-item label="工作地址" prop="work_address">
          <el-input v-model="newPositionForm.work_address" />
        </el-form-item>
        <el-form-item label="截至日期" prop="deadline">
          <el-date-picker v-model="newPositionForm.deadline" type="date" placeholder="选择日期" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddPosition">确定</el-button>
      </template>
    </el-dialog>

    <!-- 美化后的 查看详情对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      width="50%"
      :before-close="() => (detailsDialogVisible = false)"
      custom-class="detail-dialog"
    >
      <template #title>
        <el-icon class="title-icon"><info-filled /></el-icon>
        <span class="title-text">职位详情</span>
        <el-button
          class="dialog-close-btn"
          icon="Close"
          circle
          @click="detailsDialogVisible = false"
        />
      </template>

      <el-card class="detail-card" shadow="hover">
        <el-form
          label-position="left"
          label-width="120px"
          class="detail-form"
        >
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="职位名称">
                <span>{{ selectedPosition.position_name }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所属行业">
                <span>{{ selectedPosition.industry }}</span>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="所属企业">
                <span>{{ selectedPosition.enterprise_name }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="薪资范围">
                <span>{{ selectedPosition.salary_range }}</span>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="职位描述">
                <el-input
                  type="textarea"
                  :model-value="selectedPosition.description"
                  rows="3"
                  disabled
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="工作地址">
                <span>{{ selectedPosition.work_address }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="已投递人数">
                <span>{{ selectedPosition.applicants_count }}</span>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="截至日期">
                <el-icon class="item-icon"><date /></el-icon>
                <span>{{ selectedPosition.deadline }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <template #footer>
        <el-button @click="detailsDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleReviewPosition('已上架')">通过</el-button>
        <el-button type="danger" @click="handleReviewPosition('已下架')">不通过</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ManageApi from '../../Api/manageApi';

// 数据定义
const positions = ref([]);
const filteredPositions = ref([]);
const selectedIndustry = ref('');
const industries = ['制造业', '信息技术与互联网', '金融', '教育', '医疗健康', '建筑与工程', '能源与资源', '服务业'];
const dialogVisible = ref(false);

// 新增企业列表
const enterprises = ref([]);

// 新增职位表单数据
const newPositionForm = ref({
  position_name: '',
  industry: '',
  enterprise_name: '',
  description: '',
  salary_range: '',
  work_address: '',
  deadline: '',
});

// 查看详情相关变量
const detailsDialogVisible = ref(false);
const selectedPosition = ref({});

// 查看详情按钮点击事件
const handleViewDetails = (position) => {
  selectedPosition.value = position;
  detailsDialogVisible.value = true;
};

// 获取职位信息
const getPositions = async () => {
  const response = await ManageApi.getPositions();
  if (response.data.code === 200) {
    positions.value = response.data.data.map((p) => ({
      ...p,
      deadline: formatDate(p.deadline),
    }));
    filteredPositions.value = positions.value;
  }
};

// 获取企业信息
const getEnterprises = async () => {
  const response = await ManageApi.getAllEnterprises();
  if (response.data.code === 200) {
    enterprises.value = response.data.data;
  }
};

// 格式化日期为 YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// 按行业筛选职位
const filterPositionsByIndustry = () => {
  if (selectedIndustry.value) {
    filteredPositions.value = positions.value.filter((p) => p.industry === selectedIndustry.value);
  } else {
    filteredPositions.value = positions.value;
  }
};

// 处理新增职位
const handleAddPosition = async () => {
  if (!newPositionForm.value.position_name || !newPositionForm.value.industry || !newPositionForm.value.enterprise_name || !newPositionForm.value.description || !newPositionForm.value.salary_range || !newPositionForm.value.work_address || !newPositionForm.value.deadline) {
    ElMessage.error('请填写完整信息');
    return;
  }

  const response = await ManageApi.addPosition(newPositionForm.value);
  if (response.data.code === 200) {
    ElMessage.success(response.data.message);
    dialogVisible.value = false;
    await getPositions();
  } else {
    ElMessage.error(response.data.message);
  }
};

// 审核职位
const handleReviewPosition = async (status) => {
  const response = await ManageApi.reviewPosition({
    id: selectedPosition.value.id,
    status,
  });
  if (response.data.code === 200) {
    ElMessage.success(response.data.message);
    detailsDialogVisible.value = false;
    await getPositions();
  } else {
    ElMessage.error(response.data.message);
  }
};

// 删除职位
const handleDeletePosition = async (id) => {
  const response = await ManageApi.deletePosition({ id:id });
  if (response.data.code === 200) {
    ElMessage.success(response.data.message);
    await getPositions();
  } else {
    ElMessage.error(response.data.message);
  }
};

// 初始化数据
onMounted(async () => {
  await getPositions();
  await getEnterprises();
});
</script>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.add-position-btn {
  margin-left: 20px;
}

.detail-dialog .el-dialog__header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
}
.title-icon {
  margin-right: 8px;
  color: #409EFF;
}
.title-text {
  font-size: 18px;
  font-weight: bold;
  flex: 1;
}
.dialog-close-btn {
  position: absolute;
  right: 16px;
  top: 12px;
}
.detail-card {
  padding: 20px;
  border-radius: 8px;
}
.detail-form .el-form-item {
  margin-bottom: 16px;
}
.item-icon {
  margin-right: 4px;
}
</style>

<template>
  <div class="notice-container">
    <h1 class="notice-title">通知公告</h1>
    <el-button type="primary" @click="showAddNoticeDialog" class="add-notice-btn">新增公告</el-button>
    <el-table :data="notices" style="width: 100%" border class="notice-table" :row-class-name="tableRowClassName">
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
          <el-button type="danger" size="small" @click="deleteNotice(scope.row.id)" class="delete-btn">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增公告对话框 -->
    <el-dialog v-model="addNoticeDialogVisible" title="新增公告" width="30%" class="add-notice-dialog">
      <el-form :model="newNotice" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="newNotice.title"></el-input>
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="newNotice.content" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addNoticeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addNotice">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ManageApi from '../../Api/manageApi';
import { manageStore } from '@/stores/counter';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs'; // 引入 dayjs 库
import { useRouter } from 'vue-router';

const notices = ref([]);
const addNoticeDialogVisible = ref(false);
const newNotice = ref({
  title: '',
  content: '',
  admin_id: null,
});

const manage = manageStore();
const router = useRouter();

// 新增日期格式化函数
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const showAddNoticeDialog = () => {
  newNotice.value.admin_id = manage.manageInfo.manageid;
  addNoticeDialogVisible.value = true;
};

const viewNotice = (notice) => {
  router.push({ name: 'noticeDetail', params: { id: notice.id } });
};

const addNotice = async () => {
  try {
    if (!newNotice.value.title || !newNotice.value.content) {
      ElMessage.warning('标题和内容不能为空');
      return;
    }
    await ManageApi.addNotice(newNotice.value);
    ElMessage.success('公告发布成功');
    addNoticeDialogVisible.value = false;
    fetchNotices();
    newNotice.value = { title: '', content: '', admin_id: manage.manageInfo.manageid };
  } catch (error) {
    console.error('新增公告失败:', error);
    ElMessage.error('公告发布失败');
  }
};

const deleteNotice = async (id) => {
  try {
    await ManageApi.deleteNotice({ id });
    ElMessage.success('公告删除成功');
    fetchNotices();
  } catch (error) {
    console.error('删除公告失败:', error);
    ElMessage.error('公告删除失败');
  }
};

const fetchNotices = async () => {
  try {
    const response = await ManageApi.getNotices();
    // 确保 notices.value 是一个数组，并且从 response.data.data 中获取数据
    notices.value = Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    console.error('获取公告列表失败:', error);
    ElMessage.error('获取公告列表失败');
  }
};

onMounted(() => {
  fetchNotices();
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
  animation: fadeInDown 0.5s;
}

.add-notice-btn {
  margin-bottom: 20px;
  animation: fadeIn 0.5s;
}

.notice-table {
  animation: fadeInUp 0.5s;
}

.view-btn {
  margin-right: 10px;
  transition: all 0.3s ease;
}

.view-btn:hover {
  transform: scale(1.1);
}

.delete-btn {
  transition: all 0.3s ease;
}

.delete-btn:hover {
  transform: scale(1.1);
}

.add-notice-dialog {
  border-radius: 8px;
}

.view-notice-dialog {
  border-radius: 8px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
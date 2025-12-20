<template>
  <el-container class="home-container">
    <el-aside width="200px" class="sidebar">
      <el-menu
        default-active="1"
        class="menu"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <el-menu-item class="logo-item">
          <img src="https://www.jju.edu.cn/img/logo1.png" alt="" srcset="" class="logo">
        </el-menu-item>
        <el-menu-item index="1" @click="navigateTo('/manage/manageStudent')">
          <el-icon><User /></el-icon>
          <span>学生管理</span>
        </el-menu-item>
        <el-menu-item index="2" @click="navigateTo('/manage/companyManage')">
          <el-icon><Briefcase /></el-icon>
          <span>企业信息管理</span>
        </el-menu-item>
        <el-menu-item index="3" @click="navigateTo('/manage/jobManage')">
          <el-icon><Document /></el-icon>
          <span>职位管理</span>
        </el-menu-item>
        <el-menu-item index="4" @click="navigateTo('/manage/notice')">
          <el-icon><Document /></el-icon>
          <span>通知公告</span>
        </el-menu-item>
        <el-menu-item index="5" @click="navigateTo('/manage/dataManage')">
          <el-icon><Document /></el-icon>
          <span>数据分析</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <h1>九江学院经济学院就业管理系统</h1>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="30" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span>管理员</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout" @click="adminLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter } from 'vue-router';
import {
  User,
  Briefcase,
  Document,
  ArrowDown
} from '@element-plus/icons-vue';
import UserApi from '../Api/UserApi';
import { manageStore } from '@/stores/counter';
const manage = manageStore();

const router = useRouter();

// 路由跳转
const navigateTo = (path) => {
  // console.log(path);
  router.push(path);
};

const adminLogout = async () => {
  try {
    const res = await UserApi.adminLogout({username: manage.manageInfo.managename});
    if(res.data.code === 200){
      ElMessage.success('退出登录成功');
    } else {
      ElMessage.error(res.data.message || '退出登录失败');
    }
  } catch (error) {
    ElMessage.error('网络请求失败，请检查连接');
    console.error('登出请求异常:', error);
  } finally {
    manage.clearmanageStorage();
    router.push('/');
  }
};
// 下拉菜单命令处理
const handleCommand = (command) => {
  if (command === 'logout') {
    // TODO: 实现退出登录逻辑
    console.log('退出登录');
  }
};
</script>

<style scoped>
.logo-item  {
  padding: 0% !important;
  margin-bottom: 5%;
}
.logo{
  width: 100%;
}
.home-container {
  height: 100vh;
}

.sidebar {
  background-color: #545c64;
}

.menu {
  border-right: none;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.content {
  padding: 10px;
}
</style>
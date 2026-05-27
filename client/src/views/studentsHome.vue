<template>
  <el-container class="student-home-container" style="height: 100vh;">
    <el-header class="header">
      <div class="header-content">
        <span class="title">九江学院经济学院2025届就业管理系统</span>
        <el-dropdown>
          <transition name="el-fade-in">
            <span class="el-dropdown-link">
              <el-avatar :size="40" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <el-icon><ArrowDown /></el-icon>
            </span>
          </transition>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人信息</el-dropdown-item>
              <el-dropdown-item>修改密码</el-dropdown-item>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-container style="height: calc(100vh - 60px); ">
      <el-aside width="220px" class="sidebar">
        <el-menu
          default-active="1"
          class="el-menu-vertical-demo"
          @select="handleMenuSelect"
          :collapse="false"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="1" @click="navigateTo('/student/jobs')">
            <el-icon><Briefcase /></el-icon>
            <span>职位信息</span>
          </el-menu-item>
          <el-menu-item index="2" @click="navigateTo('/student/notices')">
            <el-icon><Message /></el-icon>
            <span>通知公告</span>
          </el-menu-item>
          <el-menu-item index="3" @click="navigateTo('/student/studentInfo')">
            <el-icon><User /></el-icon>
            <span>个人信息</span>
          </el-menu-item>
          <!-- <el-menu-item index="4" @click="navigateTo('/student/messagelist')">
            <el-icon><ChatDotRound /></el-icon>
            <span>在线沟通</span>
          </el-menu-item>
          <el-menu-item index="5">
            <el-icon><Document /></el-icon>
            <span>简历管理</span>
          </el-menu-item>
          <el-menu-item index="6">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item> -->
        </el-menu>
      </el-aside>
      <el-main class="main-content" style="height: calc(100vh - 60px);">
        <router-view v-slot="{ Component }">
          <transition name="slide-fade">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { studentStore } from '@/stores/counter';
import { useRouter } from 'vue-router';

const student = studentStore();
import UserApi from '@/Api/UserApi';
const router = useRouter();
const navigateTo = (path) => {
  // console.log(path);
  router.push(path);
};


// 新增退出登录处理
const handleLogout = async () => {
  try {
    
    const res = await UserApi.studentLogout({name: student.studentInfo.studentName});
    if(res.data.code === 200){
      ElMessage.success('退出登录成功');
    } else {
      ElMessage.error(res.data.message || '退出登录失败');
    }
  } catch (error) {
    ElMessage.error('网络请求失败，请检查连接');
    console.error('学生登出请求异常:', error);
  } finally {
    student.clearstudentStorage();
    router.push('/');
  }
};
</script>

<style scoped>
.student-home-container {
   
    background-color: #f5f7fa;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 防止容器溢出 */
  }

  .header {
    background-color: #304156;
    color: #ffffff;
    padding: 0 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    height: 60px; /* 固定高度 */
  }

  .header-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title {
    font-size: 20px;
    font-weight: bold;
  }

  .el-dropdown-link {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .el-dropdown-link .el-icon {
    margin-left: 8px;
  }

  .sidebar {
    background-color: #304156;
    transition: width 0.3s ease;
    height: 100%; /* 确保侧边栏高度占满 */
  }

  .el-menu {
    border-right: none;
    transition: all 0.3s ease;
    height: 100%; /* 确保菜单高度占满 */
  }

  .el-menu-item {
    transition: all 0.3s ease;
    position: relative;
  }

  .el-menu-item:hover {
    background-color: #263445 !important;
    transform: translateX(10px);
  }

  .el-menu-item::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 3px;
    background-color: #409EFF;
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }

  .el-menu-item:hover::after {
    transform: scaleY(1);
  }

  .main-content {
    padding: 20px;
    background-color: #ffffff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin: 20px;
    border-radius: 4px;
    transition: all 0.3s ease;
    height: calc(100vh - 100px); /* 确保内容区域高度占满 */
  
  }

  /* 新增动画效果 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .slide-fade-enter-active {
    transition: all 0.3s ease-out;
  }

  .slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
  }

  </style>
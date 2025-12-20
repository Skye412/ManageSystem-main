<template>
    <div class="enterprise-view">
      <!-- 顶部导航栏 - 增加阴影和渐变背景 -->
      <el-header class="header">
        <div class="header-content">
          <span class="title">
            <span class="title-icon">
              <el-icon><OfficeBuilding /></el-icon>
            </span>
            九江学院经济学院就业管理系统
          </span>
          <el-dropdown trigger="hover">
            <span class="el-dropdown-link">
              <el-avatar :size="30" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <span class="company-name">企业名称</span>
              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item divided @click="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
  
      <div class="content-wrapper">
        <!-- 侧边栏 - 增加折叠动画和阴影 -->
        <el-aside class="aside">
          <el-menu
            default-active="1"
            class="el-menu-vertical-demo"
            :collapse-transition="false"
            @select="handleMenuSelect"
          >
            <el-menu-item index="1" @click="navigateTo('/enterprise/position')">
              <template #title>
                <el-icon class="menu-icon"><Home /></el-icon>
                <span class="menu-text">职位管理</span>
              </template>
            </el-menu-item>
            <el-menu-item index="2" @click="navigateTo('/enterprise/delieverManage')">
              <el-icon class="menu-icon"><Briefcase /></el-icon>
              <span class="menu-text">投递管理</span>
            </el-menu-item>
            <el-menu-item index="3" @click="navigateTo('/enterprise/messageNotice')">
              <el-icon class="menu-icon"><User /></el-icon>
              <span class="menu-text">消息通知</span>
            </el-menu-item>
            <el-menu-item index="4">
              <el-icon class="menu-icon"><Setting /></el-icon>
              <span class="menu-text">系统设置</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
  
        <!-- 内容区 - 增加页面过渡动画 -->
        <el-main class="main">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </div>
    </div>
  </template>

<script setup>
import { useRouter } from 'vue-router';
import UserApi from '../Api/UserApi';
const router = useRouter();
import { enterpriseStore } from '@/stores/counter';
const enterprise  = enterpriseStore();
const logout = async () => {
  try {
    const res = await UserApi.enterpriseLogout({name:enterprise.enterpriseInfo.enterpriseName});
    if(res.data.code === 200){
      ElMessage.success('退出登录成功');
    } else {
      ElMessage.error(res.data.message || '退出登录失败');
    }
  } catch (error) {
    ElMessage.error('网络请求失败，请检查连接');
    console.error('学生登出请求异常:', error);
  } finally {
    enterprise.clearenterpriseStorage();
    router.push('/');
  }
};
const navigateTo = (path) => {
  // console.log(path);
  router.push(path);
};
</script>
  
  <style scoped >
  .enterprise-view {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f8f9fa;
  }
  
  .header {
    background: linear-gradient(135deg, #409eff, #337ecc);
    color: white;
    height: 64px;
    box-shadow: 0 2px 12px rgba(64,158,255,.1);
    transition: all .3s;
  
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      padding: 0 24px;
  
      .title {
        font-size: 20px;
        font-weight: 600;
        display: flex;
        align-items: center;
  
        &-icon {
          margin-right: 12px;
          display: flex;
          align-items: center;
        }
      }
    }
  }
  
  .el-dropdown-link {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all .3s;
  
    .company-name {
      margin: 0 8px;
      font-weight: 500;
    }
  
    .arrow-icon {
      transition: transform .3s;
    }
  
    &:hover {
      opacity: 0.9;
  
      .arrow-icon {
        transform: rotate(180deg);
      }
    }
  }
  
  .content-wrapper {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  .aside {
    width: 200px;
    background: white;
    box-shadow: 2px 0 8px rgba(0,0,0,.05);
    transition: width .28s;
  
    .el-menu {
      border-right: none;
      padding: 8px 0;
  
      .menu-icon {
        font-size: 18px;
        margin-right: 8px;
      }
  
      .menu-text {
        font-weight: 500;
      }
  
      .el-menu-item {
        margin: 4px 8px;
        border-radius: 6px;
        transition: all .3s;
  
        &:hover {
          background: #ecf5ff;
          color: #409eff;
        }
  
        &.is-active {
          background: #ecf5ff;
          color: #409eff;
          font-weight: 600;
        }
      }
    }
  }
  
  .main {
    flex: 1;
    padding: 20px;
    background: #f8f9fa;
    overflow-y: auto;
  }
  
  /* 页面切换动画 */
  .fade-transform-leave-active,
  .fade-transform-enter-active {
    transition: all .3s;
  }
  
  .fade-transform-enter-from {
    opacity: 0;
    transform: translateX(-30px);
  }
  
  .fade-transform-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
  </style>
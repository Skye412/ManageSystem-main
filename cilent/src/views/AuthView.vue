<template>
    <div class="auth-container">
      <el-card class="login-card" shadow="hover">
        <div class="brand-section">
          <el-icon class="brand-icon"><School /></el-icon>
          <div class="brand-text">
            <h1>九江学院经济学院</h1>
            <p class="system-name">就业信息管理系统</p>
          </div>
        </div>
  
        <div class="form-container">
          <el-form :model="form" class="login-form">
            <el-form-item>
              <el-input
                v-model="form.username"
                :placeholder="usernamePlaceholder"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
  
            <el-form-item>
              <el-input
                v-model="form.password"
                type="password"
                placeholder="密码"
                size="large"
                show-password
                :prefix-icon="Lock"
              />
            </el-form-item>
  
            <el-button 
              type="primary" 
              size="large" 
              class="login-btn"
              :icon="ArrowRightBold"
              @click="login"
            >
              {{ loginTypeLabel }}
            </el-button>
          </el-form>
  
          <div class="switch-login">
            <template v-for="(type, index) in availableTypes" :key="type">
              <span 
                class="switch-item" 
                :class="type"
                @click="switchLogin(type)"
              >
                <el-icon>
                  <Key v-if="type === 'admin'" />
                  <Briefcase v-else-if="type === 'enterprise'" />
                  <User v-else />
                </el-icon>
                <span>{{ typeLabels[type] }}</span>
              </span>
              <el-divider 
                v-if="index < availableTypes.length - 1" 
                direction="vertical" 
              />
            </template>
          </div>
        </div>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import  UserApi  from '../Api/UserApi'
  import { manageStore } from '@/stores/counter'
  import { studentStore } from '@/stores/counter'
  import { enterpriseStore } from '@/stores/counter'

  import {
    School,
    User,
    Lock,
    Key,
    Briefcase,
    ArrowRightBold
  } from '@element-plus/icons-vue'
import router from '@/router'

  
const loginType = ref('student') // 当前登录类型
  
const form = ref({
  username: '',
  password: ''
})
  
const typeConfig = {
  student: {
    label: '学生登录',
    placeholder: '学号',
    types: ['admin', 'enterprise']
  },
  admin: {
    label: '管理员登录',
    placeholder: '工号',
    types: ['student', 'enterprise']
  },
  enterprise: {
    label: '企业登录',
    placeholder: '企业账号',
    types: ['student', 'admin']
  }
}
  
const typeLabels = {
  student: '学生通道',
  admin: '管理员通道',
  enterprise: '企业通道'
}
  
const loginTypeLabel = computed(() => typeConfig[loginType.value].label)
const usernamePlaceholder = computed(() => typeConfig[loginType.value].placeholder)
const availableTypes = computed(() => typeConfig[loginType.value].types)
  
const switchLogin = (type) => {
  loginType.value = type
  form.value.username = ''
  form.value.password = ''
}

const login = async () => {
  const showMessage = (type, message) => {
    if (type === 'success') {
      ElMessage.success(message);
    } else {
      ElMessage.error(message);
    }
  };

  try {
    if (loginType.value === 'student') {
      const res = await UserApi.studentLogin({ studentId: form.value.username, password: form.value.password });
      if (res.data.code === 200) {
        const student = studentStore();
        const studentInfo = {
          id: res.data.data.id,
          studentid: res.data.data.student_id,
          studentName: res.data.data.name,
          gender: res.data.data.gender,
          age: res.data.data.age,
          avatar: res.data.data.avatar,
          major: res.data.data.major,
          class: res.data.data.class,
          graduationYear: res.data.data.graduation_year,
          resumePath: res.data.data.resume_path,
          status: res.data.data.status,
          role: "student",
          accessToken:res.data.accesstoken,
          refreshToken:res.data.refreshtoken
        };
        student.setStudentInfo(studentInfo);
        console.log(studentInfo)
        console.log(student.studentInfo)
        showMessage('success', res.data.message);
        router.push('/student');
      } else {
        showMessage('error', res.data.message);
      }
    } else if (loginType.value === 'admin') {
      const res = await UserApi.adminLogin({ username: form.value.username, password: form.value.password });
      const manage = manageStore();
      const manageInfo = {
        manageid: res.data.data.id,
        managename: res.data.data.username,
        managerole: res.data.data.role,
        accessToken:res.data.accesstoken,
        refreshToken:res.data.refreshtoken
      };
      manage.setManageInfo(manageInfo);
      if (res.data.code === 200) {
        showMessage('success', '登录成功');
        router.push('/manage');
      } else {
        showMessage('error', res.data.message);
      }
    } else if (loginType.value === 'enterprise') {
      const res = await UserApi.enterpriseLogin({ name: form.value.username, password: form.value.password });
      if (res.data.code === 200) {
        const enterprise = enterpriseStore();
        const enterpriseInfo = {
          enterpriseId: res.data.data.id,
          enterpriseName: res.data.data.name,
          contact_name: res.data.data.contact_name,
          email: res.data.data.email,
          phone: res.data.data.phone,
          role:"enterprise",
          accessToken:res.data.accesstoken,
          refreshToken:res.data.refreshtoken
        };
        enterprise.setEnterpriseInfo(enterpriseInfo);
        showMessage('success', '登录成功');
        router.push('/enterprise');
      } else {
        showMessage('error', res.data.message);
      }
    }
  } catch (error) {
    showMessage('error', '登录失败，请稍后重试');
    console.error('Login error:', error);
  }
};
  </script>
  
  
  <style scoped>
  .switch-item.student:hover {
  color: #3b82f6;
}
.switch-item.admin:hover {
  color: #e74c3c;
}
.switch-item.enterprise:hover {
  color: #2ecc71;
}
  .auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(150deg, #f8f9fa 0%, #e9ecef 100%);
  }
  
  .login-card {
    width: 440px;
    border: none;
    border-radius: 20px;
    transition: transform 0.3s ease;
  }
  
  .login-card:hover {
    transform: translateY(-5px);
  }
  
  .brand-section {
    text-align: center;
    margin-bottom: 40px;
  }
  
  .brand-icon {
    font-size: 48px;
    color: #2c3e50;
    margin-bottom: 16px;
  }
  
  .brand-text h1 {
    font-size: 24px;
    color: #2c3e50;
    margin: 8px 0;
  }
  
  .system-name {
    color: #6c757d;
    font-size: 16px;
    letter-spacing: 2px;
  }
  
  .form-container {
    padding: 0 30px;
  }
  
  .login-form :deep(.el-input__wrapper) {
    height: 48px;
    border-radius: 12px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  }
  
  .login-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    border-radius: 12px;
    margin-top: 20px;
    letter-spacing: 2px;
    background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
    border: none;
  }
  
  .switch-login {
    margin: 30px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    color: #6c757d;
  }
  
  .switch-item {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .switch-item:hover {
    color: #2563eb;
  }
  
  .switch-item:hover .el-icon {
    transform: scale(1.1);
  }
  
  .el-divider {
    margin: 0 10px;
    background-color: #dee2e6;
  }
  
  .el-icon {
    transition: transform 0.3s ease;
  }
  </style>
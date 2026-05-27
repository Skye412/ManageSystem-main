<template>
  <div class="auth-page">
    <!-- 动态背景 -->
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>

    <div class="auth-container">
      <!-- 左侧品牌区 -->
      <div class="brand-panel">
        <div class="brand-content">
          <div class="brand-logo">
            <el-icon><School /></el-icon>
          </div>
          <h1 class="brand-title">九江学院经济学院</h1>
          <p class="brand-subtitle">就业信息管理系统</p>
          <div class="brand-divider"></div>
          <p class="brand-desc">连接校园与职场，助力每一位学子扬帆起航</p>
        </div>
        <div class="brand-footer">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>

      <!-- 右侧登录区 -->
      <div class="login-panel">
        <div class="login-header">
          <h2 class="login-title">{{ loginTypeLabel }}</h2>
          <p class="login-subtitle">请输入您的账号信息以继续</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              :placeholder="usernamePlaceholder"
              size="large"
              :prefix-icon="currentIcon"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              size="large"
              show-password
              :prefix-icon="Lock"
              clearable
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              <el-icon v-if="!loading" class="btn-icon"><ArrowRightBold /></el-icon>
              <span>{{ loading ? '登录中...' : '立即登录' }}</span>
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 角色切换 -->
        <div class="role-switch">
          <p class="role-hint">其他身份登录</p>
          <div class="role-options">
            <div
              v-for="type in availableTypes"
              :key="type"
              class="role-option"
              :class="{ active: loginType === type }"
              @click="switchLogin(type)"
            >
              <div class="role-icon">
                <el-icon><Key v-if="type === 'admin'" /><Briefcase v-else-if="type === 'enterprise'" /><User v-else /></el-icon>
              </div>
              <span class="role-label">{{ typeLabels[type] }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import UserApi from '../Api/UserApi'
import { manageStore, studentStore, enterpriseStore } from '@/stores/counter'
import router from '@/router'

import {
  School,
  User,
  Lock,
  Key,
  Briefcase,
  ArrowRightBold
} from '@element-plus/icons-vue'

const formRef = ref()
const loginType = ref('student')
const loading = ref(false)

const form = ref({
  username: '',
  password: ''
})

const typeConfig = {
  student: {
    label: '学生登录',
    placeholder: '请输入学号',
    icon: User,
    types: ['admin', 'enterprise']
  },
  admin: {
    label: '管理员登录',
    placeholder: '请输入工号',
    icon: Key,
    types: ['student', 'enterprise']
  },
  enterprise: {
    label: '企业登录',
    placeholder: '请输入企业账号',
    icon: Briefcase,
    types: ['student', 'admin']
  }
}

const typeLabels = {
  student: '学生',
  admin: '管理员',
  enterprise: '企业'
}

const loginTypeLabel = computed(() => typeConfig[loginType.value].label)
const usernamePlaceholder = computed(() => typeConfig[loginType.value].placeholder)
const currentIcon = computed(() => typeConfig[loginType.value].icon)
const availableTypes = computed(() => typeConfig[loginType.value].types)

// 表单验证规则
const rules = computed(() => ({
  username: [
    { required: true, message: usernamePlaceholder.value, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}))

const switchLogin = (type) => {
  loginType.value = type
  form.value.username = ''
  form.value.password = ''
  loading.value = false
  formRef.value?.clearValidate()
}

const handleLogin = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    if (loginType.value === 'student') {
      const res = await UserApi.studentLogin({
        studentId: form.value.username,
        password: form.value.password
      })
      if (res.data.code === 200) {
        const student = studentStore()
        student.setStudentInfo({
          id: res.data.data.id,
          studentId: res.data.data.student_id,
          studentName: res.data.data.name,
          gender: res.data.data.gender,
          age: res.data.data.age,
          avatar: res.data.data.avatar,
          major: res.data.data.major,
          class: res.data.data.class,
          graduationYear: res.data.data.graduation_year,
          resumePath: res.data.data.resume_path,
          status: res.data.data.status,
          role: 'student',
          accessToken: res.data.accesstoken,
          refreshToken: res.data.refreshtoken
        })
        ElMessage.success(res.data.message)
        router.push('/student')
      } else {
        ElMessage.error(res.data.message)
      }
    } else if (loginType.value === 'admin') {
      const res = await UserApi.adminLogin({
        username: form.value.username,
        password: form.value.password
      })
      if (res.data.code === 200) {
        const manage = manageStore()
        manage.setManageInfo({
          manageid: res.data.data.id,
          managename: res.data.data.username,
          mangaerole: res.data.data.role,
          accessToken: res.data.accesstoken,
          refreshToken: res.data.refreshtoken
        })
        ElMessage.success('登录成功')
        router.push('/manage')
      } else {
        ElMessage.error(res.data.message)
      }
    } else if (loginType.value === 'enterprise') {
      const res = await UserApi.enterpriseLogin({
        name: form.value.username,
        password: form.value.password
      })
      if (res.data.code === 200) {
        const enterprise = enterpriseStore()
        enterprise.setEnterpriseInfo({
          enterpriseId: res.data.data.id,
          enterpriseName: res.data.data.name,
          contact_name: res.data.data.contact_name,
          email: res.data.data.email,
          phone: res.data.data.phone,
          role: 'enterprise',
          accessToken: res.data.accesstoken,
          refreshToken: res.data.refreshtoken
        })
        ElMessage.success('登录成功')
        router.push('/enterprise')
      } else {
        ElMessage.error(res.data.message)
      }
    }
  } catch (error) {
    ElMessage.error('登录失败，请稍后重试')
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* 动态背景形状 */
.bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: #fff;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: #fff;
  bottom: -80px;
  right: -80px;
  animation-delay: -5s;
}

.shape-3 {
  width: 200px;
  height: 200px;
  background: #fff;
  top: 50%;
  left: 10%;
  animation-delay: -10s;
}

.shape-4 {
  width: 250px;
  height: 250px;
  background: #fff;
  top: 20%;
  right: 15%;
  animation-delay: -15s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

.auth-container {
  display: flex;
  width: 900px;
  max-width: calc(100% - 40px);
  margin: 20px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

/* 左侧品牌面板 */
.brand-panel {
  flex: 1;
  background: linear-gradient(160deg, #4f46e5 0%, #7c3aed 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  color: #fff;
  position: relative;
  text-align: center;
}

.brand-logo {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
}

.brand-logo .el-icon {
  font-size: 40px;
  color: #fff;
}

.brand-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
}

.brand-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin-top: 8px;
  letter-spacing: 3px;
}

.brand-divider {
  width: 40px;
  height: 3px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
  margin: 24px auto;
}

.brand-desc {
  font-size: 14px;
  opacity: 0.75;
  line-height: 1.6;
  max-width: 260px;
}

.brand-footer {
  position: absolute;
  bottom: 30px;
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
}

.dot:nth-child(2) {
  background: rgba(255, 255, 255, 0.7);
  width: 24px;
  border-radius: 4px;
}

/* 右侧登录面板 */
.login-panel {
  flex: 1;
  padding: 50px 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  margin-bottom: 32px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.login-subtitle {
  font-size: 14px;
  color: #9ca3af;
  margin-top: 6px;
}

.login-form :deep(.el-input__wrapper) {
  height: 48px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 12px;
  background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35);
}

.login-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 18px;
}

/* 角色切换 */
.role-switch {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;
}

.role-hint {
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  margin-bottom: 12px;
}

.role-options {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  background: #fff;
}

.role-option:hover {
  border-color: #4f46e5;
  color: #4f46e5;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.1);
}

.role-option.active {
  background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}

.role-icon .el-icon {
  font-size: 16px;
}

.role-label {
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
    width: 100%;
    max-width: 420px;
  }

  .brand-panel {
    padding: 30px 20px;
    min-height: 180px;
  }

  .brand-logo {
    width: 56px;
    height: 56px;
  }

  .brand-logo .el-icon {
    font-size: 28px;
  }

  .brand-title {
    font-size: 20px;
  }

  .brand-desc {
    display: none;
  }

  .login-panel {
    padding: 30px 24px;
  }
}
</style>

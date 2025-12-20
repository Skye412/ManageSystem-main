import axios from 'axios';
import router from '@/router';
import { manageStore, studentStore, enterpriseStore } from '../stores/counter';
import  UserApi  from '../Api/UserApi';
// 创建 Axios 实例
const Axiosinstance = axios.create({
  baseURL: '/api', // 
  timeout: 10000, // 设置请求超时时间
  headers: {
    'Content-Type': 'application/json', // 设置默认的请求头
  },
});

Axiosinstance.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

Axiosinstance.interceptors.response.use(
  async (response) => {
    if (response.data.message === '令牌无效或已过期') {
      const manage = manageStore();
      const student = studentStore();
      const enterprise = enterpriseStore();
      let refreshToken = '';
      let userType = '';

      if (manage.manageInfo.refreshToken !== '') {
        refreshToken = manage.manageInfo.refreshToken;
        userType = 'manage';
      } else if (student.studentInfo.refreshToken !== '') {
        refreshToken = student.studentInfo.refreshToken;
        userType = 'student';
      } else if (enterprise.enterpriseInfo.refreshToken !== '') {
        refreshToken = enterprise.enterpriseInfo.refreshToken;
        userType = 'enterprise';
      }

      if (refreshToken) {
        try {
          const res = await UserApi.refreshToken({ refreshToken:refreshToken });
          if (res.data.message === '令牌刷新成功') {
            if (userType === 'manage') {
              manage.manageInfo.accessToken = res.data.accessToken;
            } else if (userType === 'student') {
              student.studentInfo.accessToken = res.data.accessToken;
            } else if (userType === 'enterprise') {
              enterprise.enterpriseInfo.accessToken = res.data.accessToken;
            }

            // 重新发送原始请求
            console.log(res.data.accesstoken)
            const originalRequest = response.config;
            originalRequest.headers['Authorization'] = `Bearer ${res.data.accesstoken}`;
            return Axiosinstance(originalRequest);
          } else {
            if (userType === 'manage') {
              manage.clearManageStorage();
            } else if (userType === 'student') {
              student.clearStudentStorage();
            } else if (userType === 'enterprise') {
              enterprise.clearenterpriseStorage();
            }
            router.push('/');
          }
        } catch (error) {
          console.error('刷新令牌失败:', error);
          router.push('/');
        }
      } else {
        console.log("当前是游客");
      }
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 处理 401 错误
    }
    return Promise.reject(error);
  }
);

export default Axiosinstance;
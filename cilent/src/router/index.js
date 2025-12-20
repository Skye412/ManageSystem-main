import { createRouter, createWebHistory } from 'vue-router'
import manageHomeView from '../views/manageHomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/manage',
      name: 'manage',
      component: manageHomeView,
      children: [
        {
          path: 'manageStudent',
          name: 'manageStudent',
          component: () => import('../components/manage/manageStudent.vue'),
        },{
          path: 'companyManage',
          name: 'companyManage',
          component: () => import('../components/manage/companyManage.vue'),
        },
        {
          path: 'jobManage',
          name: 'jobManage',
          component: () => import('../components/manage/jobManage.vue'),
        },
        {
          path: 'notice',
          name: 'notice',
          component: () => import('../components/manage/notice.vue'),
        },
        {
          path: 'dataManage',
          name: 'dataManage',
          component: () => import('../components/manage/dataManage.vue'),
        },
        {
          path: 'noticeDetail/:id',
          name: 'noticeDetail',
          component: () => import('../components/manage/NoticeDetailPage.vue'),
        },
      ]
    },
    {
      path: '/',
      name: 'Auth',
      component: () => import('../views/AuthView.vue'),
    },{
      path: '/student',
      name: 'student',
      component: () => import('../views/studentsHome.vue'),
      children:[
        {
          path:'jobs',
          name:'jobs',
          component:()=>import('../components/student/jobs.vue')
        },
        {
          path:'notices',
          name:'notices',
          component:()=>import('../components/student/notices.vue')
        },
        {
          path: 'jobDetail/:id',
          name: 'jobDetail',
          component: () => import('../components/student/JobDetailPage.vue')
        },
        {
          path: 'studentInfo',
          name: 'studentInfo',
          component: () => import('../components/student/studentDatamanage.vue')
        },
        {
          path: 'noticeDetail/:id',
          name: 'studentnoticeDetail',
          component: () => import('../components/student/small/NoticeDetailPage.vue'),
        },
        {
          path: 'chat',  
          name: 'studentChat',
          component: () => import('../components/student/small/chatView.vue')
        },
        // {
        //   path: 'messagelist',
        //   name: 'message',
        //   component: () => import('../components/student/messagelist.vue'),
        // },
      ]
    },
    {
      path: '/enterprise',
      name: 'enterprise',
      component:()=> import('../views/enterpriseView.vue'),
      children:[
        {
          path:'position',
          name:'position',
          component:()=>import('../components/enterprise/position.vue')
        },{
          path:'messageNotice',
          name:'messageNotice',
          component:()=>import('../components/enterprise/messageNotice.vue')
        },
        {
          path: 'positionDetail/:id',
          name: 'positionDetail',
          component: () => import('../components/enterprise/PositionDetail.vue')
        },
        {
          path: 'addPosition',
          name: 'addPosition',
          component: () => import('../components/enterprise/AddPosition.vue')
        },
        {
          path: 'editPosition/:id',
          name: 'editPosition',
          component: () => import('../components/enterprise/EditPosition.vue')
        },
        {
          path: 'delieverManage',
          name: 'delieverManage',
          component: () => import('../components/enterprise/delieverManage.vue')
        },
        {
          path: 'studentDetail/:studentId',
          name: 'StudentDetail',
          component: () => import('../components/enterprise/StudentDetailView.vue')
        },
        {
          path: 'chat',  
          name: 'enterpriseChat',
          component: () => import('../components/message/chatView.vue')
        },
      ]
    }
  ],
})




export default router;

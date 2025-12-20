<template>
    <div class="message-list">
        <div class="center">
            <!-- 新增聊天列表结构 -->
            <div v-for="item in messageList" :key="item.partner_id" 
                 class="chat-item" 
                 @click="enterChat(item)">
                <div class="avatar">
                    <el-avatar :size="40" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
                </div>
                <div class="content">
                    <div class="header">
                        <span class="name">{{ item.partner_name }}</span>
                        <span class="time">{{ formatTime(item.last_sent_at) }}</span>
                    </div>
                    <div class="message">{{ item.last_message }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import messageApi from '@/Api/messageApi';
import { studentStore } from '@/stores/counter';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';

const router = useRouter();
const student = studentStore();
const messageList = ref([]);

// 获取消息列表
const getmessagelist = async () => {
    const res = await messageApi.getmessageslist({
        student_id: student.studentInfo.id
    })
    messageList.value = res.data.data || [];
    console.log(messageList.value);
}

onMounted(async() => {
   await getmessagelist();
})



// 新增时间格式化
const formatTime = (timeStr) => {
    return dayjs(timeStr).format('YYYY-MM-DD HH:mm')
}

// 新增进入聊天
const enterChat = (item) => {
    router.push({
        path: '/student/chat',
        query: {
           partner_type: 'enterprise',
            partner_id: item.partner_id
        }
    })
}
</script>

<style scoped>
.message-list{
    height: 100%;
    width: 100%;
}
.center {
    width: 70%;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    padding: 20px; /* 新增内边距 */
}

/* 新增聊天项样式 */
.chat-item {
    display: flex;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background 0.3s;
}

.chat-item:hover {
    background: #f5f7fa;
}

.avatar {
    margin-right: 15px;
}

.content {
    flex: 1;
}

.header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.name {
    font-weight: 600;
    color: #304156;
}

.time {
    font-size: 12px;
    color: #909399;
}

.message {
    font-size: 14px;
    color: #606266;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
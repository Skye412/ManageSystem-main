<template>
    <div class="message-notice">
        <div class="center">
            <div class="message-list">
                <!-- 消息列表项 -->
                <div 
                    v-for="(item, index) in messageList" 
                    :key="index" 
                    class="message-item"
                    @click="goToChat(item)"
                >
                    <div class="user-avatar">
                        <span class="avatar-text">{{ item.partner_name?.charAt(0) || '?' }}</span>
                    </div>
                    <div class="message-content">
                        <div class="user-info">
                            <span class="user-name">{{ item.partner_name }}</span>
                            <span class="message-time">{{ formatTime(item.last_sent_at) }}</span>
                        </div>
                        <div class="last-message">{{ item.last_message }}</div>
                    </div>
                </div>
                
                <!-- 空数据提示 -->
                <div v-if="messageList.length === 0" class="empty-tips">
                    暂无聊天记录
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import messageApi from '@/Api/messageApi';
import { enterpriseStore } from '@/stores/counter';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';

const router = useRouter();
const enterprise = enterpriseStore();
const messageList = ref([]);

// 获取消息列表
const getmessagelist = async () => {
    const res = await messageApi.getmessageslist({
        enterprise_id: enterprise.enterpriseInfo.enterpriseId
    })
    messageList.value = res.data.data || [];
}

// 时间格式化
const formatTime = (time) => {
    return dayjs(time).format('YYYY-MM-DD HH:mm');
}

// 获取角色图标
const getRoleIcon = (type) => {
    const icons = {
        'enterprise': 'icon-company',
        'student': 'icon-user',
        'admin': 'icon-admin'
    }
    return icons[type] || 'icon-chat';
}


const goToChat = (item) => {
    router.push({
        path: '/enterprise/chat',
        query: {
            partner_type: item.partner_type,
            partner_id: item.partner_id
        }
    });
}

onMounted(async () => {
    await getmessagelist();
})
</script>

<style scoped>
.message-notice {
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
}

.center {
    width: 70%;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.message-item {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background 0.3s;
}

.message-item:hover {
    background-color: #f8f9fa;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #409eff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    font-weight: 600;
    color: white;
    font-size: 18px;
}

.message-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.user-info {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 3px;
}

.user-name {
    font-weight: 600;
    color: #333;
    font-size: 15px;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.last-message {
    color: #666;
    font-size: 13px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.empty-tips {
    text-align: center;
    padding: 30px;
    color: #999;
}
</style>
<template>
    <div class="chat-view">
        <!-- 顶部标题栏 -->
        <div class="header">
            <el-button type="text" @click="$router.go(-1)" class="back-btn">
                <el-icon class="back-icon"><ArrowLeft /></el-icon>
            </el-button>
            <div class="title">{{ partnerInfo.name }}</div>
        </div>

        <!-- 消息区域 -->
        <el-scrollbar class="message-area" ref="scrollbar">
            <div 
                v-for="msg in processedMessages" 
                :key="msg.id"
                class="message-wrapper"
                :class="{ 'self': msg.isMine }"
            >
                <!-- 对方消息 -->
                <div v-if="!msg.isMine" class="other-message">
                    <el-avatar :size="36" :style="{ backgroundColor: getAvatarColor(partnerInfo.name) }">
                        <img src="@/assets/default-avatar.png" alt="avatar">
                    </el-avatar>
                    <div class="message-content">
                        <div class="name">{{ partnerInfo.name }}</div>
                        <div class="bubble">
                            {{ msg.message }}
                            <div class="time">{{ formatTime(msg.sent_at) }}</div>
                        </div>
                    </div>
                </div>

                <!-- 自己消息 -->
                <div v-if="msg.isMine" class="self-message">
                    <div class="bubble">
                        {{ msg.message }}
                        <div class="time">{{ formatTime(msg.sent_at) }}</div>
                    </div>
                    <el-avatar :size="36" :style="{ backgroundColor: getAvatarColor(currentUser.studentName) }">
                        <span class="avatar-text">{{ getFirstChar(currentUser.studentName) }}</span>
                    </el-avatar>
                </div>
            </div>
        </el-scrollbar>

        <!-- 消息发送区域 -->
        <div class="send-area">
            <el-input 
                v-model="messageText"
                placeholder="输入消息..."
                @keyup.enter="sendMessage"
                class="input-box"
            >
                <template #append>
                    <el-button 
                        type="primary" 
                        @click="sendMessage"
                        :disabled="!messageText.trim()"
                    >
                        发送
                    </el-button>
                </template>
            </el-input>
        </div>
    </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import { useRoute } from 'vue-router' // 修改：使用useRoute替代useRouter获取路由参数
import { studentStore } from '@/stores/counter'
import messageApi from '@/Api/messageApi'
import { nextTick, watch } from 'vue'


const student = studentStore()
const currentRoute = useRoute() // 修改：重命名为currentRoute更语义化
const currentUser = student.studentInfo;
const scrollbar = ref(null)
const messageText = ref('')
const partnerInfo = ref({})
const processedMessages = ref([])

// 处理消息数据
const processMessages = (data) => {
    const partner = data.participants.find(p => p.type !== 'student')
    partnerInfo.value = {
        name: partner.contact_name || partner.name,
        type: partner.type
    }

    processedMessages.value = data.messages.map(msg => ({
        ...msg,
        isMine: msg.sent_by === 'student'
    }))
}

// 时间格式化
const formatTime = (timeStr) => {
    const date = new Date(timeStr)
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 发送消息
const sendMessage = async () => {
    try {
        if (!messageText.value.trim()) {
            ElMessage.warning('消息内容不能为空')
            return
        }
        const params = {
            message: messageText.value,
            sent_by: 'student',
            student_id: currentUser.id,
            enterprise_id: currentRoute.query.partner_id
        }
        await messageApi.studentSendMessage(params)
        messageText.value = ''
        await  fetchChats();
        await scrollToBottom()
    } catch (error) {
        ElMessage.error('消息发送失败')
        console.error('发送失败:', error)
    }
}

// 获取首字符和头像颜色方法
const getFirstChar = (name) => name ? name.charAt(0) : '未'
const getAvatarColor = (name) => {
    const colors = ['#FFB6C1', '#87CEFA', '#98FB98', '#DDA0DD', '#FFA07A']
    return colors[(name?.charCodeAt(0) || 0) % colors.length]
}

// 滚动到底部逻辑
const scrollToBottom = async () => {
    await nextTick()
    if (scrollbar.value?.wrapRef) {
        scrollbar.value.wrapRef.scrollTop = scrollbar.value.wrapRef.scrollHeight
    }
}

// 修改后的fetchChats方法
const fetchChats = async () => {
    try {
        const response = await messageApi.getChatMessages({
            student_id: String(currentUser.id),
            enterprise_id: String(currentRoute.query.partner_id),
        })
        processMessages(response.data.data)
        console.log(response.data.data)
        await scrollToBottom()
    } catch (error) {
        console.error('获取聊天记录失败:', error)
    }
}

watch(processedMessages, scrollToBottom)

onMounted(async() => {
  await  fetchChats();
})


</script>

<style scoped>
.chat-view {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.header {
    display: flex;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #eee;
    background: #fff;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.back-btn {
    margin-right: 16px;
    padding: 8px;
    transition: all 0.3s;
}

.message-area {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.message-wrapper {
    display: flex;
    margin-bottom: 8px;  /* 调整消息间距 */
    width: 100%;  /* 新增：确保容器占满宽度 */
}

.other-message {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start !important; /* 加强样式权重 */
    width: 100%;
}

.self-message {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end !important; /* 加强样式权重 */
    width: 100%;
}

.message-content .bubble {
    background: #f0f0f0;
    padding: 12px;
    /* border-radius: 18px; */
    max-width: 80%;  /* 调整最大宽度 */
    margin-left: 8px;  /* 新增头像间距 */
}

.self-message .bubble {
    background: #07C160; /* 保持微信绿色 */
    color: white;
    margin-right: 8px;
    border-radius: 8px; /* 恢复统一圆角 */
}

.self-message .time {
    font-size: 12px;
    color: rgba(255,255,255,0.7); /* 时间文字半透明效果 */
    margin-top: 4px;
    text-align: right; /* 时间右对齐 */
}

.message-content {
    display: flex;
    flex-direction: column;
}

.message-content .name {
    font-size: 14px;
    color: #999;
    margin-bottom: 4px;
}

.message-content .time {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
    text-align: right;
}

.send-area {
    padding: 16px;
    border-top: 1px solid #eee;
    background: white;
}
</style>
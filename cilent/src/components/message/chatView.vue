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
                        <!-- 根据用户类型显示头像 -->
                        <span v-if="partnerInfo.type === 'student'" class="avatar-text">{{ getFirstChar(partnerInfo.name) }}</span>
                        <img v-else src="@/assets/default-avatar.png" alt="avatar">
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
                    <el-avatar :size="36" :style="{ backgroundColor: getAvatarColor(currentUser.name) }">
                        <span class="avatar-text">{{ getFirstChar(currentUser.name) }}</span>
                    </el-avatar>
                </div>
            </div>
        </el-scrollbar>

        <!-- 新增消息发送区域 -->
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
import { ref, onMounted, watch, nextTick } from 'vue'
import { enterpriseStore } from '@/stores/counter';
import messageApi from '@/Api/messageApi';
import { useRoute } from 'vue-router'

// 新增scrollbar引用声明
const scrollbar = ref(null)
const route = useRoute()
const enterprise = enterpriseStore();
const currentUser = enterprise.enterpriseInfo
const partnerInfo = ref({})
const processedMessages = ref([])

// 处理消息数据
const processMessages = (data) => {
    // 获取对方信息
    const partner = data.participants.find(p => p.type !== currentUser.role)
    partnerInfo.value = {
        name: partner.name || partner.contact_name,
        type: partner.type  // 新增类型字段
    }

    // 处理消息
    processedMessages.value = data.messages.map(msg => ({
        ...msg,
        isMine: msg.sent_by === currentUser.role
    }))
}

// 时间格式化
const formatTime = (timeStr) => {
    const date = new Date(timeStr)
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 新增滚动到底部方法，增加容错处理
const scrollToBottom = async () => {
  await nextTick()
  try {
    if (scrollbar.value?.wrapRef) {
      const scrollContainer = scrollbar.value.wrapRef
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  } catch (e) {
    console.error('滚动失败:', e)
  }
}

// 修改fetchMessages方法
const fetchMessages = async () => {
  if (route.query.partner_type === 'student') {
    const res = await messageApi.getChatMessages({
      enterprise_id: currentUser.enterpriseId,
      student_id: route.query.partner_id
    })
    console.log(res.data.data)
    processMessages(res.data.data)
    await scrollToBottom() // 新增滚动调用
  }
}

onMounted(async() => {
   await fetchMessages();
})

// 获取名字首字符
const getFirstChar = (name) => {
    return name ? name.charAt(0) : '未'
}

// 生成头像背景色（根据名字哈希值）
const getAvatarColor = (name) => {
    const colors = ['#FFB6C1', '#87CEFA', '#98FB98', '#DDA0DD', '#FFA07A']
    const hash = name ? name.charCodeAt(0) : 0
    return colors[hash % colors.length]
}

// 新增消息输入框响应式变量
const messageText = ref('')

// 修改发送消息方法
const sendMessage = async () => {
  try {
    if (!messageText.value.trim()) {
      ElMessage.warning('消息内容不能为空')
      return
    }

    const params = {
      message: messageText.value,
      sent_by: 'enterprise',
      enterprise_id: currentUser.enterpriseId
    }

    // 根据聊天对象类型设置参数
    if (route.query.partner_type === 'student') {
      params.student_id = route.query.partner_id
    }

    await messageApi.enterpriseSendMessage(params)
    
    messageText.value = ''
    await fetchMessages()
    await scrollToBottom() // 新增滚动调用
    
  } catch (error) {
    ElMessage.error('消息发送失败')
    console.error('发送失败:', error)
  }
}

// 新增watch监听消息变化
watch(processedMessages, async () => {
  await scrollToBottom()
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
    
    &:hover {
        background: var(--el-color-primary-light-9);
    }
    
    :deep(.back-icon) {
        font-size: 24px;
        color: var(--el-color-primary);
        transition: color 0.3s;
    }
    
    &:hover :deep(.back-icon) {
        color: var(--el-color-primary-dark-2);
    }
}

.title {
    font-size: 16px;
    font-weight: 500;
}

.message-area {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.message-wrapper {
    margin-bottom: 20px;
}

.other-message {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.self-message {
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    gap: 12px;
}

.bubble {
    max-width: 60%;
    padding: 12px;
    border-radius: 5px;
    position: relative;
    background: #f0f0f0;
}

.self .bubble {
    background: #95ec69;
}

.name {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
}

.time {
    font-size: 12px;
    color: #999;
    text-align: right;
    margin-top: 4px;
}

.avatar-text {
    font-size: 18px;
    color: white;
    text-transform: uppercase;
    user-select: none;
}

.el-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    flex-shrink: 0;
}

/* 新增发送区域样式 */
.send-area {
    padding: 16px;
    border-top: 1px solid #eee;
    background: white;
}

.input-box {
    border-radius: 20px;
}

.input-box :deep(.el-input__inner) {
    border-radius: 20px;
    padding-right: 80px;
}

.input-box :deep(.el-input-group__append) {
    background: transparent;
    border: none;
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
}
</style>
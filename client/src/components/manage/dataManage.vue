<template>
  <div class="data-manage-dashboard">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>就业数据分析</h2>
      <el-button type="primary" :icon="Refresh" @click="refreshData" :loading="loading">
        刷新数据
      </el-button>
    </div>

    <!-- 加载骨架屏 -->
    <template v-if="loading">
      <el-row :gutter="20" class="kpi-row">
        <el-col :span="6" v-for="i in 4" :key="i">
          <el-card shadow="hover" class="kpi-card">
            <el-skeleton animated>
              <template #template>
                <el-skeleton-item variant="text" style="width: 40%; margin-bottom: 12px;" />
                <el-skeleton-item variant="text" style="width: 60%; font-size: 28px;" />
              </template>
            </el-skeleton>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="chart-row">
        <el-col :span="14"><el-card shadow="hover"><el-skeleton :rows="8" animated /></el-card></el-col>
        <el-col :span="10"><el-card shadow="hover"><el-skeleton :rows="8" animated /></el-card></el-col>
      </el-row>
    </template>

    <!-- 空数据状态 -->
    <el-empty v-else-if="!hasData" description="暂无就业数据" />

    <!-- 主内容区域 -->
    <template v-else>
      <!-- KPI 统计卡片 -->
      <el-row :gutter="20" class="kpi-row">
        <el-col :span="6">
          <el-card shadow="hover" class="kpi-card">
            <el-statistic title="学生总数" :value="summary.totalStudents" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="kpi-card">
            <el-statistic title="已就业人数" :value="summary.employedStudents" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="kpi-card">
            <el-statistic title="就业率" :value="summary.employmentRate" suffix="%" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="kpi-card">
            <el-statistic title="专业/班级数" :value="summary.majorCount" />
            <div class="kpi-sub">{{ summary.classCount }} 个班级</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表第一行：堆叠柱状图 + 环形饼图 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :span="14">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>各专业班级就业状态分布</span>
              </div>
            </template>
            <v-chart class="chart" :option="barChartOption" autoresize />
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>总体就业状态分布</span>
              </div>
            </template>
            <v-chart class="chart pie-chart" :option="pieChartOption" autoresize />
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表第二行：各专业就业率对比 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :span="24">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>各专业就业率对比</span>
              </div>
            </template>
            <v-chart class="chart rate-chart" :option="majorRateChartOption" autoresize />
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import ManageApi from '@/Api/manageApi'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

use([
  CanvasRenderer,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
])

const loading = ref(true)
const rawData = ref({})

// 判断是否有数据
const hasData = computed(() => {
  return Object.keys(rawData.value).length > 0
})

// 状态颜色映射
const STATUS_COLORS = {
  '已就业': '#67C23A',
  '未就业': '#F56C6C',
  '升学': '#409EFF',
  '即将就业': '#E6A23C',
}

// 汇总统计数据
const summary = computed(() => {
  const data = rawData.value
  let totalStudents = 0
  let employedStudents = 0
  let majorCount = 0
  let classCount = 0
  const statusTotals = {}

  for (const major in data) {
    majorCount++
    for (const cls in data[major]) {
      classCount++
      const clsData = data[major][cls]
      totalStudents += clsData.totalStudents || 0
      for (const status in clsData.statusDistribution || {}) {
        const count = clsData.statusDistribution[status] || 0
        statusTotals[status] = (statusTotals[status] || 0) + count
        if (status === '已就业') employedStudents += count
      }
    }
  }

  return {
    totalStudents,
    employedStudents,
    employmentRate: totalStudents > 0 ? Math.round((employedStudents / totalStudents) * 10000) / 100 : 0,
    majorCount,
    classCount,
    statusTotals,
  }
})

// 堆叠柱状图：各专业班级就业状态分布
const barChartOption = computed(() => {
  const data = rawData.value
  const xAxisData = []
  const statusSet = new Set()
  const seriesMap = {}

  for (const major in data) {
    for (const cls in data[major]) {
      const key = `${major} - ${cls}`
      xAxisData.push(key)
      const dist = data[major][cls].statusDistribution || {}
      for (const status in dist) {
        statusSet.add(status)
        if (!seriesMap[status]) seriesMap[status] = {}
        seriesMap[status][key] = dist[status]
      }
    }
  }

  const series = Array.from(statusSet).map(status => ({
    name: status,
    type: 'bar',
    stack: 'total',
    emphasis: { focus: 'series' },
    itemStyle: { color: STATUS_COLORS[status] || '#909399' },
    data: xAxisData.map(key => seriesMap[status]?.[key] || 0),
  }))

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: { rotate: xAxisData.length > 6 ? 30 : 0, fontSize: 11 },
    },
    yAxis: { type: 'value' },
    series,
  }
})

// 环形饼图：总体就业状态分布
const pieChartOption = computed(() => {
  const statusTotals = summary.value.statusTotals || {}

  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{d}%' },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: Object.entries(statusTotals).map(([name, value]) => ({
          name,
          value,
          itemStyle: { color: STATUS_COLORS[name] || '#909399' },
        })),
      },
    ],
  }
})

// 横向柱状图：各专业就业率对比
const majorRateChartOption = computed(() => {
  const data = rawData.value
  const majors = []
  const rates = []

  for (const major in data) {
    let majorTotal = 0
    let majorEmployed = 0
    for (const cls in data[major]) {
      const clsData = data[major][cls]
      majorTotal += clsData.totalStudents || 0
      majorEmployed += (clsData.statusDistribution || {})['已就业'] || 0
    }
    majors.push(major)
    rates.push(majorTotal > 0 ? Math.round((majorEmployed / majorTotal) * 10000) / 100 : 0)
  }

  // 按就业率降序排序
  const sorted = majors.map((m, i) => ({ major: m, rate: rates[i] })).sort((a, b) => b.rate - a.rate)
  const sortedMajors = sorted.map(s => s.major)
  const sortedRates = sorted.map(s => s.rate)

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c}%' },
    grid: { left: '20%', right: '10%', top: '10%', bottom: '10%', containLabel: false },
    xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    yAxis: { type: 'category', data: sortedMajors, axisLabel: { fontSize: 12 } },
    series: [
      {
        type: 'bar',
        data: sortedRates,
        barWidth: '50%',
        label: { show: true, position: 'right', formatter: '{c}%' },
        itemStyle: {
          color: params => {
            const val = params.value
            if (val >= 80) return '#67C23A'
            if (val >= 60) return '#E6A23C'
            return '#F56C6C'
          },
          borderRadius: [0, 4, 4, 0],
        },
      },
    ],
  }
})

// 获取数据的通用方法
async function fetchData() {
  loading.value = true
  try {
    const response = await ManageApi.getEmploymentStatistics()
    rawData.value = response.data.data || response.data
  } catch (error) {
    ElMessage.error('获取就业统计数据失败')
    console.error('获取就业统计数据失败:', error)
    rawData.value = {}
  } finally {
    loading.value = false
  }
}

// 刷新数据
function refreshData() {
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.data-manage-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.kpi-row {
  margin-bottom: 20px;
}

.kpi-card {
  border-radius: 8px;
  text-align: center;
}

.kpi-card :deep(.el-statistic__head) {
  font-size: 14px;
  color: #909399;
}

.kpi-card :deep(.el-statistic__content) {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.kpi-sub {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
}

.chart-card :deep(.el-card__header) {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding: 12px 20px;
}

.card-header {
  display: flex;
  align-items: center;
}

.chart {
  width: 100%;
  height: 400px;
}

.pie-chart {
  height: 400px;
}

.rate-chart {
  height: 300px;
}
</style>

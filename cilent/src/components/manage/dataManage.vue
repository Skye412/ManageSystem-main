<template>
    <div>
      <h1>就业数据分析</h1>
      <v-chart 
        class="echarts" 
        :option="chartOption"
        style="width: 100%; height: 400px;"
        ref="chartRef"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import { use } from 'echarts/core';
  import { CanvasRenderer } from 'echarts/renderers';
  import { BarChart } from 'echarts/charts';
  import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
  import VChart, { THEME_KEY } from 'vue-echarts';
  import ManageApi from '@/Api/manageApi';
  
  // 确保所有需要的模块都已注册
  use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent]);
  
  const chartOption = ref({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: []
    },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value'
    },
    series: []
  });
  
  const chartRef = ref(null);
  
  onMounted(async () => {
    try {
      const response = await ManageApi.getEmploymentStatistics();
      console.log(response.data);
    //   if (response.data.code === 200) {
    //     console.log(response.data);
    //     updateChartOption(response);
    //   }
    updateChartOption(response.data.data);
    } catch (error) {
      console.error('获取就业统计数据失败:', error);
    }
  });
  
  // 将数据处理逻辑提取为独立函数
  function updateChartOption(data) {
    const legendData = new Set(); // 存储唯一的状态
    const xAxisData = [];
    const seriesMap = {}; // 使用对象来存储系列数据
    
    // 第一次遍历：收集所有状态和班级信息
    for (const major in data) {
      for (const classId in data[major]) {
        xAxisData.push(`${major} - ${classId}`);
        const statusDistribution = data[major][classId].statusDistribution;
        
        // 收集所有存在的状态
        for (const status in statusDistribution) {
          legendData.add(status);
        }
        
        // 初始化每个班级的状态数据（包括不存在的状态）
        seriesMap[classId] = seriesMap[classId] || {};
        for (const status of legendData) {
          seriesMap[classId][status] = statusDistribution[status] || 0;
        }
      }
    }
  
    // 将 Set 转换为数组
    const legendArray = Array.from(legendData);
    
    // 构建系列数据
    const seriesData = legendArray.map(status => {
      return {
        name: status,
        type: 'bar',
        data: xAxisData.map(className => {
          const classId = className.split(' - ')[1];
          return seriesMap[classId]?.[status] || 0;
        })
      };
    });
  
    // 更新图表配置
    chartOption.value = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: legendArray
      },
      xAxis: {
        type: 'category',
        data: xAxisData
      },
      yAxis: {
        type: 'value'
      },
      series: seriesData
    };
  }
  </script>
  
  <style scoped>
  .echarts {
    width: 100%;
    height: auto;
  }
  </style>
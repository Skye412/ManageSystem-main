<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <h1>企业信息管理</h1>
        <el-button type="primary" @click="dialogVisible = true">添加企业</el-button>
      </div>
    </template>

    <el-table :data="enterprises" style="width: 100%" border stripe>
      <el-table-column prop="name" label="企业名称" width="120" />
      <el-table-column prop="contact_name" label="联系人" width="90" />
      <el-table-column prop="address" label="地址" width="180">
        <template #default="{ row }">
          {{ row.address.replace(/ /g, '-') }}
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="电话" width="150">
        <template #default="{ row }">
          {{ row.phone }}
          <el-button type="text" @click="copyToClipboard(row.phone)">复制</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" width="240">
        <template #default="{ row }">
          {{ row.email }}
          <el-button type="text" @click="copyToClipboard(row.email)">复制</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" :formatter="formatDate" width="150" />
    </el-table>

    <el-dialog v-model="dialogVisible" title="添加企业" width="50%">
      <el-form :model="form" label-width="80px">
        <el-form-item label="企业名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="form.contact_name" />
        </el-form-item>
        <el-form-item label="地址">
          <el-cascader
            v-model="form.address"
            :options="areaOptions"
            :props="{ expandTrigger: 'hover' }"
            placeholder="请选择省市区"
          />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addEnterprise">确认</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ManageApi from '@/Api/manageApi'
import areaData from '@/public/area.json'


const enterprises = ref([])
const dialogVisible = ref(false)
const form = ref({
  name: '',
  contact_name: '',
  address: [],
  phone: '',
  email: ''
})

const areaOptions = ref([])

const fetchEnterprises = async () => {
  try {
    const res = await ManageApi.getAllEnterprises()
    enterprises.value = res.data.data;
    console.log(enterprises.value)
  } catch (error) {
    console.error('获取企业信息失败:', error)
  }
}

const addEnterprise = async () => {
  try {
    // 将地址数组转换为字符串
    const addressStr = form.value.address.join(' ');
    const payload = {
      ...form.value,
      address: addressStr
    };

    const res = await ManageApi.addEnterprise(payload);
    if(res.data.code === 200){
        ElMessage.success('添加企业成功');
        // 将新添加的企业信息插入到列表中
        enterprises.value.unshift(res.data.data);
    }else{
        ElMessage.error(res.data.message);
    }
    dialogVisible.value = false;
    
  } catch (error) {
    console.error('添加企业失败:', error);
    ElMessage.error('添加企业失败');
  }
}

const formatDate = (row, column, cellValue) => {
  const date = new Date(cellValue);
  return date.toLocaleDateString();
}

const transformAreaData = (data) => {
  return Object.keys(data).map(province => {
    const cities = data[province]
    return {
      value: province,
      label: province,
      children: Object.keys(cities).map(city => {
        return {
          value: city,
          label: city,
          children: cities[city].map(district => {
            return {
              value: district,
              label: district
            }
          })
        }
      })
    }
  })
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

onMounted(() => {
  fetchEnterprises()
  areaOptions.value = transformAreaData(areaData)
})
</script>

<style scoped>
.el-card {
  margin: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
<template>
  <el-container class="student-management">
    <el-aside class="sidebar">
      <el-menu :default-active="activeMajor" class="major-list">
        <el-sub-menu v-for="major in majors" :key="major.major" :index="major.major" @click="handleMajorClick(major.major)">
          <template #title>{{ major.major }}</template>
          <el-menu-item
            v-for="cls in major.classes"
            :key="cls.class"
            @click="handleClassClick(cls.class, cls.count, cls.advisor)"
          >
            {{ cls.class }}
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
      <el-button type="primary" class="add-major-class-btn" @click="dialogVisibleMajorClass = true">新增专业班级</el-button>
    </el-aside>

    <!-- 右侧内容区域 -->
    <el-main class="content">
      <div class="header-with-info">
        <h2 v-if="selectedClass">班级: {{ selectedClass }}</h2>
        <div v-if="selectedClass" class="class-info-right">
          班主任: {{ selectedAdvisor }} | 人数: {{ selectedCount }}人
        </div>
        <el-button v-if="selectedClass" type="success" class="add-student-btn" @click="dialogVisibleStudent = true">新增学生</el-button>
      </div>

      <!-- 学生信息表格 -->
      <el-table v-if="students.length > 0" :data="students" style="width: 100%">
        <el-table-column prop="student_id" label="学号" width="150" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="major" label="专业" width="150" />
        <el-table-column prop="class" label="班级" width="120" />
        <el-table-column prop="graduation_year" label="毕业年份" width="120" />
        <el-table-column prop="resume_path" label="简历路径" />
      </el-table>
      <el-empty v-else description="暂无学生信息"></el-empty>
    </el-main>

    <!-- 新增专业班级对话框 -->
    <el-dialog v-model="dialogVisibleMajorClass" title="添加专业班级" width="500" center>
      <el-form :model="newMajorForm" label-width="100px">
        <el-form-item label="专业名称">
          <el-input v-model="newMajorForm.major_name" placeholder="请输入专业名称"></el-input>
        </el-form-item>
        <el-form-item label="班级名称">
          <el-input v-model="newMajorForm.class_name" placeholder="请输入班级名称"></el-input>
        </el-form-item>
        <el-form-item label="班主任">
          <el-input v-model="newMajorForm.class_advisor" placeholder="请输入班主任姓名"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisibleMajorClass = false">取消</el-button>
          <el-button type="primary" @click="addMajorClass">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增学生对话框 -->
    <el-dialog v-model="dialogVisibleStudent" title="新增学生" width="500" center>
      <el-form :model="newStudentForm" label-width="100px">
        <el-form-item label="学号">
          <el-input v-model="newStudentForm.student_id" placeholder="请输入学号"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="newStudentForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="newStudentForm.gender" placeholder="请选择性别">
            <el-option label="男" value="男"></el-option>
            <el-option label="女" value="女"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="newStudentForm.age" :min="18" :max="30"></el-input-number>
        </el-form-item>
        <el-form-item label="毕业年份">
          <el-input-number v-model="newStudentForm.graduation_year" :min="2020" :max="2030"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisibleStudent = false">取消</el-button>
          <el-button type="primary" @click="addStudent">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import ManageApi from '../../Api/manageApi';

// 数据定义
const majors = ref([]);
const students = ref([]);
const selectedClass = ref(null);
const selectedAdvisor = ref('');
const selectedCount = ref(0);
const selectedMajor = ref('');

// 表单数据
const newMajorForm = ref({ major_name: '', class_name: '', class_advisor: '' });
const newStudentForm = ref({
  student_id: '',
  name: '',
  gender: '',
  age: 22,
  graduation_year: 2025,
  major: selectedMajor,
  class: selectedClass
});

// 对话框显示状态
const dialogVisibleMajorClass = ref(false);
const dialogVisibleStudent = ref(false);

// 获取专业及班级数据
const getMajors = async () => {
  const response = await ManageApi.getMajorsAndClasses();
  if (response.data.code === 200) {
    majors.value = response.data.data;
  }
};

// 获取学生数据
const getStudents = async (name) => {
  const response = await ManageApi.getStudentsByClassName({ className: name });
  if (response.data.code === 200) {
    students.value = response.data.data;
  }
};

// 处理班级点击事件
const handleClassClick = async (className, count, advisor) => {
  selectedClass.value = className;
  selectedCount.value = count;
  selectedAdvisor.value = advisor;
  await getStudents(className);
};

const handleMajorClick = async (majorName) => {
  selectedMajor.value = majorName;
};

// 新增专业班级
const addMajorClass = () => {
  // TODO: 调用 API 提交新增专业班级数据
  dialogVisibleMajorClass.value = false;
  ElMessage.success('新增专业班级成功');
};

// 新增学生
const addStudent = () => {
  // TODO: 调用 API 提交新增学生数据
  dialogVisibleStudent.value = false;
  ElMessage.success('新增学生成功');
};

// 初始化数据
onMounted(async () => {
  await getMajors();
});
</script>

<style scoped>
/* 页面布局样式 */
.student-management {
  display: flex;
  height: 100%;
}

.sidebar {
  border-right: 1px solid #e6e6e6;
  width: 200px;
  padding: 10px;
}

.content {
  flex: 1;
  padding: 20px;
}

.header-with-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.class-info-right {
  font-size: 14px;
  color: #666;
}

.add-major-class-btn {
  width: 100%;
  margin-top: 10px;
}

.add-student-btn {
  margin-left: 20px;
}
</style>
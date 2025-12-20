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
  
      <!-- 右侧学生信息 -->
      <el-main class="content">
        <div class="header-with-info">
          <h2 v-if="selectedClass">班级: {{ selectedClass }}</h2>
         
          <!-- 班级信息靠右对齐 -->
          <div v-if="selectedClass" class="class-info-right">
            班主任: {{ selectedAdvisor }} | 人数: {{ selectedCount }}人
          </div>
          <el-button v-if="selectedClass" type="success" class="add-student-btn" @click="dialogVisibleStudent = true">新增学生</el-button>
        </div>
  
        <el-table v-if="students.length > 0" :data="students" style="width: 100%">
          <el-table-column prop="student_id" label="学号" width="120" />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="gender" label="性别" width="60" />
          <el-table-column prop="age" label="年龄" width="60" />
          <el-table-column prop="major" label="专业" width="120" />
          <el-table-column prop="class" label="班级" width="90" />
          <el-table-column prop="graduation_year" label="毕业年份" width="90" />
          <el-table-column prop="resume_path" label="简历">
            <template #default="scope">
              <el-link type="primary" :href="formatResumePath(scope.row.resume_path)" target="_blank">查看</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="就业状态" />
        </el-table>
        <el-empty v-else description="暂无学生信息"></el-empty>
      </el-main>
    </el-container>
  
    <!-- 新增专业班级对话框 -->
    <el-dialog 
      v-model="dialogVisibleMajorClass" 
      title="新增专业班级" 
      width="30%"
    >
      <el-form :model="newMajorForm" label-width="100px">
        <el-form-item label="专业名称" prop="major_name">
          <el-input v-model="newMajorForm.major_name" />
        </el-form-item>
        <el-form-item label="班级名称" prop="class_name">
          <el-input v-model="newMajorForm.class_name" />
        </el-form-item>
        <el-form-item label="班主任" prop="class_advisor">
          <el-input v-model="newMajorForm.class_advisor" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisibleMajorClass = false">取消</el-button>
        <el-button type="primary" @click="handleAddMajorClass">确定</el-button>
      </template>
    </el-dialog>
  
    <!-- 新增学生对话框 -->
    <el-dialog 
      v-model="dialogVisibleStudent" 
      title="新增学生" 
      width="30%"
      @open="disablePageScroll"
      @close="enablePageScroll"
    >
      <el-form :model="newStudentForm" label-width="100px">
        <el-form-item label="学号" prop="student_id">
          <el-input v-model="newStudentForm.student_id" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="newStudentForm.name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="newStudentForm.gender" placeholder="请选择性别">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业" prop="major">
            <el-input v-model="newStudentForm.major" disabled />
        </el-form-item>
        <el-form-item label="班级" prop="class"  >
            <el-input v-model="newStudentForm.class"  />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input v-model.number="newStudentForm.age" />
        </el-form-item>
        <el-form-item label="毕业年份" prop="graduation_year">
          <el-input v-model="newStudentForm.graduation_year" />
        </el-form-item>
        <el-form-item label="就业状态" prop="status">
          <el-select v-model="newStudentForm.status" placeholder="请选择就业状态">
            <el-option label="就业" value="就业" />
            <el-option label="升学" value="升学" />
            <el-option label="未就业" value="未就业" />
            <el-option label="即将就业" value="即将就业" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisibleStudent = false">取消</el-button>
        <el-button type="primary" @click="handleAddStudent">确定</el-button>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';

  import ManageApi from '../../Api/manageApi';

  
  // 数据定义
  const majors = ref([]);
  const students = ref([]);
  const selectedClass = ref(null);
  const selectedAdvisor = ref('');
  const selectedCount = ref(0);
  const selectedMajor = ref('');

  // 表单数据
  const newMajorForm = ref({
    major_name: '',
    class_name: '',
    class_advisor: ''
  });

  const newStudentForm = ref({
    student_id: '',
    name: '',
    gender: '',
    age: 22,
    graduation_year: 2025,
    major: selectedMajor,
    className: selectedClass,
    status: '未就业' // 新增就业状态字段，默认值为'未就业'
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

  // 处理新增专业班级
  const handleAddMajorClass = async () => {
    if (!newMajorForm.value.major_name || !newMajorForm.value.class_name || !newMajorForm.value.class_advisor) {
      ElMessage.error('请填写完整信息');
      return;
    }

    const response = await ManageApi.addMajorClass(newMajorForm.value);
    if (response.data.code === 200) {
      ElMessage.success(response.data.message);
      dialogVisibleMajorClass.value = false;
      await getMajors();
    } else {
      ElMessage.error(response.data.message);
    }
  };

  // 处理新增学生
  const handleAddStudent = async () => {
    if (!newStudentForm.value.student_id || !newStudentForm.value.name || !newStudentForm.value.gender) {
      ElMessage.error('请填写完整信息');
      return;
    }

    if (!/^\d{11}$/.test(newStudentForm.value.student_id)) {
      ElMessage.error('学号必须为11位数字');
      return;
    }

      const response = await ManageApi.addStudentToClass(newStudentForm.value);
    if (response.data.code === 200) {
      ElMessage.success(response.data.message);
      dialogVisibleStudent.value = false;
      selectedCount.value = selectedCount.value + 1;
      await getStudents(selectedClass.value);
    } else {
      ElMessage.error(response.data.message);
    }
    
    
  };

  // 初始化数据
  onMounted(async () => {
    await getMajors();
  });

  // 格式化简历路径，去除api并加上http://127.0.0.1:3000/
  const formatResumePath = (resumePath) => {
    if (!resumePath) return '';
    return `http://127.0.0.1:3000/${resumePath.replace('api/', '')}`;
  };

  </script>
  
  <style scoped>
  /* 新增样式：标题与班级信息在同一行 */
  .header-with-info {
      width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  /* 调整班级信息样式 */
  .class-info-right {
    font-size: 14px;
    color: #666;
    padding-right: 3%;
  }
  
  .student-management {
    height: 100%;
    width: 100%;
  }
  .sidebar {
    border-right: 1px solid #e6e6e6;
    width: 15%;
  }
  .major-list {
    border-right: none;
  }
  .content {
    width: 80%;
    padding: 10px;
  }
  
  /* 新增按钮样式 */
  .add-major-class-btn {
    width: 90%;
    margin: 10px auto;
    display: block;
  }
  
  .add-student-btn {
    margin-left: 20px;
  }
  </style>
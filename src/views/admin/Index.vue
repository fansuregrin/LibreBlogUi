<template>
  <el-space wrap alignment="start">
    <el-card>
      <el-descriptions border title="个人信息" :column="1" size="large">
        <template #extra>
          <el-button :icon="Edit" text @click="dialog.visible = true"/>
        </template>
        <el-descriptions-item label="头像" label-align="right">
          <el-avatar size="large" :src="user.avatar"/>
        </el-descriptions-item>
        <el-descriptions-item label="用户名" label-align="right">{{ user.username }}</el-descriptions-item>
        <el-descriptions-item label="姓名" label-align="right">{{ user.realname }}</el-descriptions-item>
        <el-descriptions-item label="电子邮箱" label-align="right">{{ user.email }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card ref="statsCardRef">
      <el-descriptions title="统计信息" border :column="2">
        <el-descriptions-item label="文章总数">{{ stats.articleCount }}</el-descriptions-item>
        <el-descriptions-item label="用户总数">{{ stats.userCount }}</el-descriptions-item>
        <el-descriptions-item label="分类总数">{{ stats.categoryCount }}</el-descriptions-item>
        <el-descriptions-item label="标签总数">{{ stats.tagCount }}</el-descriptions-item>
        <el-descriptions-item label="在线用户">{{ stats.onlineUserCount }}</el-descriptions-item>
      </el-descriptions>
      <div id="article-count-by-category"></div>
    </el-card>
  </el-space>
  <el-dialog v-model="dialog.visible" :width="dialog.width" title="更新个人信息">
    <el-form :model="user" ref="userFormRef" label-width="auto" :rules="rules">
      <el-form-item prop="username" label="用户名">
        <el-input v-model="user.username"/>
      </el-form-item>
      <el-form-item prop="realname" label="姓名">
        <el-input v-model="user.realname"/>
      </el-form-item>
      <el-form-item prop="email" label="电子邮箱">
        <el-input v-model="user.email"/>
      </el-form-item>
      <el-form-item label="头像">
        <el-upload action="#" :show-file-list="false"
          :http-request="uploadFile" :on-success="onUploadSuccess"
        >
          <el-avatar size="large" :src="user.avatar"/>
        </el-upload>
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="submitUser();dialog.visible=false">更新</el-button>
  </el-dialog>
</template>

<script setup>
import { ref, useTemplateRef, onBeforeMount, onMounted, watch } from 'vue'
import { useWindowSize, useElementSize } from '@vueuse/core'
import { Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores/user'
import { uploadService } from '@/api/oss'
import { userSelfGetService, userUpdateService } from '@/api/user'
import { categoryArticleCountService } from '@/api/category'
import { dashboardStatsService } from '@/api/dashboard'
import { validateUsername, validateEmail } from '@/utils/validate'

const { width, height } = useWindowSize()

const loading = ref(true)
const userStore = useUserStore()
const user = ref({})
const userFormRef = useTemplateRef('userFormRef')
const dialog = ref({
  visible: false,
  width: '50%'
})
const statsCardRef = useTemplateRef('statsCardRef')
const statsCardSize = useElementSize(statsCardRef)
const stats = ref({})
const categoryArticleCount = ref([])

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { validator: validateUsername, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ]
}

const screeAdaptation = (width) => {
  if (width < 768) {
    dialog.value.width = '95%'
  } else {
    dialog.value.width = '50%'
  }
}

watch(width, screeAdaptation)

const uploadFile = async (options) => {
  let file = options.file
  return await uploadService(file)
}

const onUploadSuccess = (resp) => {
  console.debug('upload user avatar successfully')
  user.value.avatar = resp.data
}

const submitUser = async () => {
  let isValid
  try {
    isValid = await userFormRef.value.validate()
  } catch (error) {
    ElMessage.warning('请正确填写用户信息')
  }
  if (isValid) {
    try {
      await userUpdateService(user.value)
      ElMessage.success('更新成功')
    } catch (error) {
      ElMessage.error('更新失败')
    }
  }
}

const drawArticleCountByCategoryChart = async () => {
  try {
    let result = await categoryArticleCountService()
    categoryArticleCount.value = result.data
  } catch (error) {
    return
  }
  let articleCountByCategroyChart = echarts.init(
    document.getElementById('article-count-by-category'), null, {
      width: 300,
      height: 200
    })
  let pieData = categoryArticleCount.value.map(item => ({
    name: item.categoryName,
    value: item.articleNum
  }))
  articleCountByCategroyChart.setOption({
    title: { text: '分类下的文章数量', textStyle: { fontSize: 15 } },
    series: [
      {
        type: 'pie',
        data: pieData,
        label: { position: 'inside', formatter: '{b} {d}%' }
      }
    ]
  })
}

onMounted(() => {
  drawArticleCountByCategoryChart()
})

onBeforeMount(async () => {
  screeAdaptation(width.value)
  loading.value = true
  try {
    let result = await userSelfGetService()
    user.value = result.data
    userStore.setUser(user.value)
    result = await dashboardStatsService()
    stats.value = result.data
    loading.value = false
  } catch (error) {
    console.debug(error)
  }
})

</script>

<style scoped>
.el-card {
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }
}

#article-count-by-category {
  margin: 15px auto;
}
</style>
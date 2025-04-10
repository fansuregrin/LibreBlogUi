<template>
  <el-space wrap>
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
import { ref, useTemplateRef, onBeforeMount, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { uploadService } from '@/api/oss'
import { userSelfGetService, userUpdateService } from '@/api/user'
import { validateUsername, validateEmail } from '@/utils/validate'

const { width } = useWindowSize()

const loading = ref(true)
const userStore = useUserStore()
const user = ref({})
const userFormRef = useTemplateRef('userFormRef')
const dialog = ref({
  visible: false,
  width: '50%'
})

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

onBeforeMount(async () => {
  screeAdaptation(width.value)
  loading.value = true
  let result = await userSelfGetService()
  user.value = result.data
  userStore.setUser(user.value)
  loading.value = false
})

</script>

<style scoped>
.el-card {
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }
}

</style>
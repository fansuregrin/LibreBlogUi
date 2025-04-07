<template>
  <el-card>
    <el-space wrap>
      <div v-loading="loading">
        <el-space>
          <el-upload :disabled="!userFormActive" action="#" :show-file-list="false"
            :http-request="uploadFile" :on-success="onUploadSuccess"
          >
            <el-avatar size="large" :src="user.avatar"/>
          </el-upload>
          <span>您好，{{ user?.realname }}！</span>
          <el-switch v-model="userFormActive" :active-action-icon="Unlock"
            :inactive-action-icon="Lock"
          />
        </el-space>
        <el-form :model="user" ref="userFormRef" :disabled="!userFormActive" 
          label-width="auto"
        >
          <el-form-item prop="username" label="用户名">
            <el-input v-model="user.username"/>
          </el-form-item>
          <el-form-item prop="realname" label="姓名">
            <el-input v-model="user.realname"/>
          </el-form-item>
          <el-form-item prop="email" label="电子邮箱">
            <el-input v-model="user.email"/>
          </el-form-item>
        </el-form>
        <el-button type="primary" :disabled="!userFormActive" @click="submitUser(user)">
          更新
        </el-button>
      </div>
      <div>
        
      </div>
    </el-space>
  </el-card>
</template>

<script setup>
import { ref, useTemplateRef, onBeforeMount } from 'vue'
import { Lock, Unlock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { uploadService } from '@/api/oss'
import { userSelfGetService, userUpdateService } from '@/api/user'

const loading = ref(true)
const userStore = useUserStore()
const user = ref({})
const userFormRef = useTemplateRef('userFormRef')
const userFormActive = ref(false)

const uploadFile = async (options) => {
  let file = options.file
  return await uploadService(file)
}

const onUploadSuccess = (resp) => {
  user.avatar = resp.data
}

const submitUser = async (user) => {
  await userUpdateService(user)
    .then(() => {
      ElMessage.success('更新成功')
    })
    .catch((error) => {
      console.log(error)
      ElMessage.error('更新失败')
    })
}

onBeforeMount(async () => {
  loading.value = true
  let result = await userSelfGetService()
  user.value = result.data
  userStore.setUser(user.value)
  loading.value = false
})

</script>

<style scoped>
</style>
<template>
  <div class="welcome-container">
    <el-card class="welcome-card">
      <template #header>
      </template>
      <h2 class="welcome-title">欢迎来到管理后台</h2>
      <div class="welcome-content">
        <p>您好，{{ user?.realname }}！</p>
        <p>欢迎使用 LibreBlog 的管理后台。您可以在这里管理网站的各个方面。</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { userSelfGetService } from '@/api/user'

const user = ref({})

const getUserInfo = async () => {
  let result = await userSelfGetService()
  user.value = result.data
}

getUserInfo()

</script>

<style scoped>
.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.welcome-card {
  padding: 20px;
  border-radius: 8px;
  margin-top: 40px;
}

.welcome-title {
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

.welcome-content {
  text-align: center;
}
</style>
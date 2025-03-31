<template>
  <div class="auth-container">
    <el-card class="auth-card">
      <template #header>
        <div class="auth-header">
          <el-radio-group v-model="activeTab" size="large">
            <el-radio-button value="login">登录</el-radio-button>
            <el-radio-button value="register">注册</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      
      <div v-if="activeTab === 'login'">
        <el-form
          ref="loginFormRef"
          :rules="rules"
          :model="loginData"
        >
          <el-form-item prop="username">
            <el-input 
              v-model="loginData.username"
              :prefix-icon="User" 
              placeholder="请输入用户名"
              clearable
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input 
              v-model="loginData.password"
              :prefix-icon="Lock" 
              placeholder="请输入密码"
              clearable
              type="password"
              show-password
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input 
              v-model="loginData.confirmPassword"
              :prefix-icon="Lock" 
              placeholder="请再次输入密码"
              clearable
              type="password"
              show-password
            />
          </el-form-item>
          <el-row justify="space-between">
            <el-col :span="12">
              <el-checkbox>记住密码</el-checkbox>
            </el-col>
            <el-col :span="12" class="text-right">
              <el-link type="primary">忘记密码?</el-link>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button
              type="primary"
              class="auth-btn"
              :loading="loading"
              @click="login"
            >
              立即登录
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 第三方登录 -->
        <div class="third-party-login">
          <div class="divider">
            <span class="divider-text">其他登录方式</span>
          </div>
          <div class="icons">
            <el-icon :size="24"><ChatDotRound /></el-icon>
            <el-icon :size="24"><Cellphone /></el-icon>
            <el-icon :size="24"><Avatar /></el-icon>
          </div>
        </div>
      </div>

      <div v-else>
        <el-form 
          :model="registerData" 
          ref="registerFormRef"
          :rules="rules"
        >
          <!-- 用户名 -->
          <el-form-item prop="username">
            <el-input
              v-model="registerData.username"
              placeholder="请输入用户名（4-16位字母数字）"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>

          <!-- 密码 -->
          <el-form-item prop="password">
            <el-input
              v-model="registerData.password"
              placeholder="请输入密码（6-20位）"
              :prefix-icon="Lock"
              type="password"
              show-password
              clearable
            />
          </el-form-item>

          <!-- 确认密码 -->
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerData.confirmPassword"
              placeholder="请再次输入密码"
              :prefix-icon="Lock"
              type="password"
              show-password
              clearable
            />
          </el-form-item>

          <!-- 邮箱 -->
          <el-form-item prop="email">
            <el-input
              v-model="registerData.email"
              placeholder="请输入邮箱"
              :prefix-icon="Message"
              clearable
            />
          </el-form-item>

          <!-- 姓名 -->
          <el-form-item prop="realname">
            <el-input
              v-model="registerData.realname"
              placeholder="请输入姓名"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>

          <!-- 提交按钮 -->
          <el-form-item>
            <el-button 
              type="primary" 
              class="auth-btn"
              @click="register"
              :loading="loading"
            >
              立即注册
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 底部链接 -->
      <div class="auth-footer">
        <el-link type="primary" @click="activeTab = 'login'" v-if="activeTab === 'register'">
          已有账号？立即登录
        </el-link>
        <el-link type="primary" @click="activeTab = 'register'" v-else>
          没有账号？立即注册
        </el-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, ChatDotRound, Cellphone, Avatar } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { validatePassword, validateEmail } from '@/utils/validate'
import { userLoginService, userRegisterService, userSelfGetService } from '@/api/user'
import { useTokenStore } from '@/stores/token'
import { useUserStore } from '@/stores/user'
import { AxiosError } from 'axios'

const router = useRouter()
const tokenStore = useTokenStore()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)

const loginFormRef = ref(null)
const loginData = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const registerFormRef = ref(null)
const registerData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  realname: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  let password = (activeTab.value === 'login' ? loginData.value.password : 
    registerData.value.password)
  if (value === '') {
    callback(new Error('请再次确认密码'))
  } else if (value !== password) {
    callback(new Error('请确保两次输入的密码一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 16, message: '长度仅限 4~16 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ]
}

const login = async () => {
  try {
    loading.value = true
    await loginFormRef.value.validate()
    let result = await userLoginService(loginData.value)
    ElMessage.success(result.msg ? result.msg : '登录成功')
    tokenStore.setToken(result.data)
    result = await userSelfGetService()
    userStore.setUser(result.data)
    router.push('/admin')
  } catch (error) {
    // console.log(error)
    if (error instanceof AxiosError) {
      ElMessage.warning(error.response.data.msg)
    } else {
      ElMessage.warning('请正确填写登录信息')
    }
  } finally {
    loading.value = false
  }
}

const register = async () => {
  try {
    loading.value = true
    await registerFormRef.value.validate()
    let result = await userRegisterService(registerData.value)
    ElMessage.success(result.msg ? result.msg : '注册成功')
    activeTab.value = 'login'
  } catch (error) {
    console.log(error)
    ElMessage.warning('请正确填写注册信息')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.auth-card {
  width: 500px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-width: 90%;
}

.auth-header {
  text-align: center;
  margin-bottom: 20px;
}

.auth-footer {
  text-align: center;
  margin-top: 20px;
}

.el-form-item {
  padding-top: 5px;
  padding-bottom: 5px;
}

.auth-btn {
  width: 100%;
  margin-top: 10px;
}

.third-party-login {
  margin-top: 20px;
  text-align: center;
}

.divider {
  position: relative;
  color: #909399;
  margin: 16px 0;
}

.divider::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100vw;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent 0%,
    #dcdfe6 20%,
    #dcdfe6 80%,
    transparent 100%
  );
  transform: translate(-50%, -50%);
  z-index: 0;
}

.divider-text {
  position: relative;
  padding: 0 10px;
  background: white;
  z-index: 1;
}

.icons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
  color: #606266;
  cursor: pointer;
}

.text-right {
  text-align: right;
}

@media (max-width: 768px) {
  .auth-card {
    width: 90%;
    margin: 0 5%;
  }
}
</style>
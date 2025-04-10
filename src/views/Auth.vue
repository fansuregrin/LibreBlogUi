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
          <el-form-item prop="verifyCode">
            <el-space>
              <el-input :prefix-icon="Key" v-model="loginData.verifyCode" placeholder="请输入验证码"/>
              <el-image class="captcha" v-loading="captchaObj.loading" 
                :src="captchaObj.captcha"
              />
              <el-button :icon="Refresh" text @click="getCaptcha()" style="padding: 0;">
                换一张？
              </el-button>
            </el-space>
          </el-form-item>
          <el-row justify="space-between">
            <el-col :span="12">
              <el-checkbox v-model="rememberPasword">记住密码</el-checkbox>
            </el-col>
            <el-col :span="12" class="text-right">
              <el-link type="primary">忘记密码?</el-link>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button
              type="primary"
              class="auth-btn"
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

          <!-- 验证码 -->
          <el-form-item prop="verifyCode">
            <el-space>
              <el-input :prefix-icon="Key" v-model="registerData.verifyCode" placeholder="请输入验证码"/>
              <el-image class="captcha" v-loading="captchaObj.loading" 
                :src="captchaObj.captcha"
              />
              <el-button :icon="Refresh" text @click="getCaptcha()" style="padding: 0;">
                换一张？
              </el-button>
            </el-space>
          </el-form-item>

          <!-- 提交按钮 -->
          <el-form-item>
            <el-button 
              type="primary" 
              class="auth-btn"
              @click="register"
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
import { ref, useTemplateRef, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User, Lock, Message, ChatDotRound, Cellphone, Avatar, Refresh,
  Key
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { AxiosError } from 'axios'
import { Base64 } from 'js-base64'
import { validateUsername, validatePassword, validateEmail } from '@/utils/validate'
import { userLoginService, userRegisterService, userCaptchaService } from '@/api/user'
import { useTokenStore } from '@/stores/token'
import { useLoginDataStore } from '@/stores/login'

const router = useRouter()
const tokenStore = useTokenStore()
const loginDataStore = useLoginDataStore()

const activeTab = ref('login')
const rememberPasword = ref(false)
const captchaObj = ref({
  loading: true,
  captcha: ''
})

const loginFormRef = useTemplateRef('loginFormRef')
const loginData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  uuid: '',
  verifyCode: ''
})

const registerFormRef = useTemplateRef('registerFormRef')
const registerData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  realname: '',
  uuid: '',
  verifyCode: ''
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
    { validator: validateUsername, trigger: 'blur' }
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
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

const login = async () => {
  let isValid = false
  try {
    isValid = await loginFormRef.value.validate()
  } catch (error) {
    console.debug('validate login form', error)
    ElMessage.warning('请正确填写登录信息')
  }
  if (!isValid) return;

  try {
    let result = await userLoginService(loginData.value)
    ElMessage.success('登录成功')
    tokenStore.setToken(result.data)

    if (rememberPasword.value) {
      let loginData_ = {
        username: loginData.value.username,
        password: loginData.value.password,
        confirmPassword: loginData.value.confirmPassword
      }
      let data = Base64.encode(JSON.stringify(loginData_))
      loginDataStore.setLoginData(data)
    } else {
      loginDataStore.removeLoginData()
    }
    router.push('/admin')
  } catch (error) {
    console.debug(error)
    if (error instanceof AxiosError) {
      ElMessage.error(error.response.data.msg)
    }
  }
}

const register = async () => {
  let isValid = false
  try {
    isValid = await registerFormRef.value.validate()
  } catch (error) {
    console.debug('validate register form', error)
    ElMessage.warning('请正确填写注册信息')
  }
  if (!isValid) return

  try {
    await userRegisterService(registerData.value)
    registerData.value = {}
    ElMessage.success('注册成功')
    activeTab.value = 'login'
    loginDataStore.removeLoginData()
    loginData.value = {}
    loginFormRef.value.resetFields()
  } catch (error) {
    if (error instanceof AxiosError) {
      console.debug(error.response.data?.msg)
      if (error.response.status === 409) {
        ElMessage.error('用户名被占用')
      } else {
        ElMessage.error(error.response.data.msg)
      }
    }
  }
}

const getCaptcha = async () => {
  captchaObj.value.loading = true
  try {
    let result = await userCaptchaService()
    captchaObj.value.captcha = result.data.captcha
    if (activeTab.value === 'login') {
      loginData.value.uuid = result.data.uuid
    } else {
      registerData.value.uuid = result.data.uuid
    }
    captchaObj.value.loading = false
  } catch (error) {
    ElMessage.error('获取验证码失败')
  }
}

watch(activeTab, async (value) => {
  await getCaptcha()
})

onMounted(() => {
  if (tokenStore.token) {
    router.push('/admin')
    return
  }
  getCaptcha()
  let storedLoginData = loginDataStore.loginData
  if (storedLoginData) {
    try {
      let loginData_ = JSON.parse(Base64.decode(storedLoginData))
      loginData.value = loginData_
      rememberPasword.value = true
    } catch (error) {
      console.debug(error)
    }
  }
})
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

.captcha {
  --el-loading-spinner-size: 20px
}

@media (max-width: 768px) {
  .auth-card {
    width: 90%;
    margin: 0 5%;
  }
}
</style>
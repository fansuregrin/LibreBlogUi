<template>
  <div class="layout-container">
    <el-header class="fixed-header">
      <div class="header-content">
        <el-button v-if="mobileHeader" :icon="Menu" text @click="sideBar = true"/>
        <el-menu v-else
          class="nav-menu"
          mode="horizontal" 
          router
          :default-active="activeMenu"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-sub-menu index="/category">
            <template #title>分类</template>
            <el-menu-item 
              v-for="category in categoryList"
              :index="`/category/${category.slug}`"
            >
              {{ category.name }}
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
        <div class="header-right">
          <el-button text circle :icon="Search"></el-button>
          <el-dropdown v-if="isLogin" @command="handleCommand">
            <span>
              <el-avatar :src="userStore.user.avatar"/>
              <el-icon><caret-bottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="SwitchButton" command="logout">登出</el-dropdown-item>
                <el-dropdown-item :icon="Setting" command="admin">进入后台</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button class="auth-button" type="primary" 
            @click="router.push('/auth')" v-else
          >
            登录/注册
          </el-button>
        </div>
      </div>
    </el-header>
    <el-drawer v-model="sideBar" size="50%" direction="ltr" :with-header="false">
      <el-menu 
        class="nav-menu"
        @select="handleMenuSelect"
        mode="vertical" 
        :default-active="activeMenu"
      >
        <el-menu-item index="/">首页</el-menu-item>
        <el-sub-menu index="category">
          <template #title>分类</template>
          <el-menu-item 
            v-for="category in categoryList"
            :index="`/category/${category.slug}`"
          >
            {{ category.name }}
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-drawer>
    <el-main class="main-content">
      <router-view></router-view>
    </el-main>
    <el-footer>
    </el-footer>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, CaretBottom, SwitchButton, Setting, Menu } from '@element-plus/icons-vue'
import { useWindowSize } from '@vueuse/core'
import { categoryListAllService } from '@/api/category'
import { useTokenStore } from '@/stores/token'
import { useUserStore } from '@/stores/user'
import { useLogout } from '@/utils/logout'

const route = useRoute()
const router = useRouter()
const tokenStore = useTokenStore()
const userStore = useUserStore()
const activeMenu = ref(route.fullPath)
const mobileHeader = ref(false)
const sideBar = ref(false)
const { width } = useWindowSize()
const logout = useLogout()
const isLogin = ref(false)

const categoryList = ref([])

const getAllCategories = async () => {
  let result = await categoryListAllService()
  categoryList.value = result.data
}

const handleMenuSelect = (index, indexPath) => {
  sideBar.value = false
  router.push(index)
}

const setMobileHeader = (width) => {
  if (width < 768) {
    mobileHeader.value = true
  } else {
    mobileHeader.value = false
  }
}

watch(width, setMobileHeader)

const checkLogin = () => {
  if (tokenStore.token) {
    isLogin.value = true
  } else {
    isLogin.value = false
  }
}

const handleCommand = (command) => {
  if (command === 'admin') {
    router.push('/admin')
  } else if (command === 'logout') {
    logout(() => { isLogin.value = false })
  }
}

onBeforeMount(() => {
  setMobileHeader(width.value)
  getAllCategories()
  checkLogin()
})
</script>
  
<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  height: 50px;
  padding-left: 5px;
  padding-right: 5px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.nav-menu {
  border: none;
  height: 100%;
  flex: auto;
}

.header-right {
  display: flex;
  align-items: center;
}

.search-input {
  width: 150px;
  transition: all 0.3s;
}

.search-input:hover {
  width: 200px;
}

.auth-button {
  margin-left: 10px;
  margin-right: 5px;
}

.main-content {
  padding-top: 60px;
  background: radial-gradient(circle, #f5f5f5, #dbedfb);
}

:deep(.el-tooltip__trigger:focus-visible) {
  outline: unset;
}
</style>
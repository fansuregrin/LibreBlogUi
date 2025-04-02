<template>
  <div class="layout-container">
    <el-header class="fixed-header">
      <div class="header-content" v-if="mobileHeader">
        <el-button :icon="More" text @click="sideBar = true"></el-button>
      </div>
      <div class="header-content" v-else>
        <el-menu 
          class="nav-menu"
          router
          mode="horizontal" 
          :default-active="activeMenu"
        >
          <el-sub-menu index="console">
            <template #title>控制台</template>
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/admin">个人中心</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="manage">
            <template #title>管理</template>
            <el-menu-item index="/admin/article">文章</el-menu-item>
            <el-menu-item index="/admin/category">分类</el-menu-item>
            <el-menu-item index="/admin/tag">标签</el-menu-item>
            <el-menu-item index="/admin/user">用户</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
    </el-header>
    <el-drawer v-model="sideBar" size="50%" direction="ltr" :with-header="false">
      <el-menu 
        class="nav-menu"
        mode="vertical" 
        :default-active="activeMenu"
        @select="handleMenuSelect"
      >
      <el-sub-menu index="console">
        <template #title>控制台</template>
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/admin">个人中心</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="manage">
        <template #title>管理</template>
        <el-menu-item index="/admin/article">文章</el-menu-item>
        <el-menu-item index="/admin/category">分类</el-menu-item>
        <el-menu-item index="/admin/tag">标签</el-menu-item>
        <el-menu-item index="/admin/user">用户</el-menu-item>
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
import { ref, onBeforeMount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { More } from '@element-plus/icons-vue'
import { useWindowSize } from '@vueuse/core'
import { menuSelfListService } from '@/api/menu'

const route = useRoute()
const router = useRouter()
const activeMenu = ref(route.fullPath)
const mobileHeader = ref(false)
const sideBar = ref(false)
const { width } = useWindowSize()

const setMobileHeader = (newVal) => {
  if (newVal <= 768) {
    mobileHeader.value = true
  } else {
    mobileHeader.value = false
  }
}

watch(width, setMobileHeader)

onBeforeMount(() => {
  setMobileHeader(width.value)
})

const handleMenuSelect = (index, indexPath) => {
  sideBar.value = false
  router.push(index)
}
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

.main-content {
  padding-top: 60px;
  background: radial-gradient(circle, #f5f5f5, #dbedfb);
}
</style>
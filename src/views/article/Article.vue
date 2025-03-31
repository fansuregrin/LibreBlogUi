<template>
  <div class="article-container" v-if="!loading">
    <el-card class="article-card">
      <template #header>
        <h2 class="article-title">{{ article.title }}</h2>
        <div class="article-meta">
          <el-text>
            <el-icon><User /></el-icon>
            <router-link :to="`/user/${article.author.id}`" class="link">
              {{ article.author.realname }}
            </router-link>
          </el-text>
          <el-text>
            <el-icon><Clock /></el-icon>
            {{ formatDateTime(article.createTime, 'YYYY-MM-DD') }}
          </el-text>
          <el-text>
            <el-icon><Box /></el-icon>
            <router-link :to="`/category/${article.category.slug}`" class="link">
              {{ article.category.name }}
            </router-link>
          </el-text>
          <el-tag v-for="tag in article.tags" :key="tag" type="info" 
            size="small" @click="router.push(`/tag/${tag.slug}`)"
          >
            {{ tag.name }}
          </el-tag>
        </div>
      </template>
      <MdPreview :modelValue="article.content" />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { User, Clock, Box } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { MdPreview } from 'md-editor-v3'
import { articleGetService } from '@/api/article'
import { formatDateTime } from '@/utils/date'
import { onMounted } from 'vue'
import router from '@/router'

const route = useRoute()

const article = ref({})
const loading = ref(true)

const getArticle = async () => {
  let id = route.params.id
  let result = await articleGetService(id)
  article.value = result.data
  loading.value = false
}

onMounted(() => {
  getArticle()
})
</script>

<style scoped>
.article-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.article-card {
  border-radius: 6px;
  width: 100%;
  max-width: 800px;
}

.article-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-top: 10px;
  margin-bottom: 15px;
  padding: 0;
  text-align: center;
}

.article-meta {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px 15px;
  color: #7f8c8d;

  .el-icon {
    margin-left: 5px;
    margin-right: 5px;
  }
  
  .el-tag {
    margin-left: 5px;
  }
}
</style>
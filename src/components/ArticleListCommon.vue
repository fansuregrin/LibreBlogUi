<template>
  <div class="article-container" v-if="!loading">
    <div v-if="title" class="title">{{ title }}</div>
    <el-card class="article-card" v-for="article in articles" :key="article.id">
      <template #header>
        <div class="article-header">
          <router-link :to="`/article/${article.id}`" class="link article-title">
            {{ article.title }}
          </router-link>
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
            <el-tag v-for="tag in article.tags" :key="tag.id" 
              type="info" size="small" @click="router.push(`/tag/${tag.slug}`)"
            >
              {{ tag.name }}
            </el-tag>
          </div>
        </div>
      </template>

      <div class="article-excerpt">{{ article.excerpt }}</div>

      <template #footer>
        <div class="article-footer">
          <el-button text :icon="Reading" @click="router.push(`/article/${article.id}`)">
            阅读全文
          </el-button>
          <el-button text :icon="ChatDotRound">
            {{ article.comment_count }} 评论
          </el-button>
          <el-button text :icon="Star">
            {{ article.like_count }} 点赞
          </el-button>
        </div>
      </template>
    </el-card>
    <el-pagination
      background
      layout="prev, pager, next, jumper, sizes, total"
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[5, 10, 15, 20]"
      :pager-count="5"
      @current-change="onCurrentPageChange"
      @size-change="onPageSizeChange"
      class="pagination"
    />
  </div>
</template>

<script setup>
import '@/assets/main.css'
import { ref, onMounted, watch } from 'vue'
import { User, Clock, Reading, ChatDotRound, Star } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { formatDateTime } from '@/utils/date'

const props = defineProps({
  getArticles: {
    type: Function,
    required: true
  },
  title: {
    type: String,
    default: ''
  }
})

const router = useRouter()
const loading = ref(true)
const articles = ref([])

const pagination = ref({
  currentPage: 1,
  pageSize: 5,
  total: 0
})

const onCurrentPageChange = (page) => {
  pagination.value.currentPage = page
  getArticlesPage()
}

const onPageSizeChange = (newSize) => {
  pagination.value.pageSize = newSize
  pagination.value.currentPage = 1
  getArticlesPage()
}

const getArticlesPage = async () => { 
  loading.value = true
  let params = {
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize
  }
  let result = await props.getArticles(params)
  articles.value = result.data.items
  pagination.value.total = result.data.total
  loading.value = false
}

onMounted(() => {
  getArticlesPage()
})

watch(() => props.getArticles, () => {
  getArticlesPage()
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

.title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.article-card {
  border-radius: 6px;
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }
}

.article-header {
  .article-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .article-meta {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px 15px;
    color: #7f8c8d;
    
    .el-tag {
      margin: 0 0;
    }
  }
}

.article-excerpt {
  color: #34495e;
}

.pagination {
  margin-top: 20px;
  justify-content: center;
}

@media (max-width: 768px) {
  .pagination {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px;
  }
}
</style>
<template>
  <ArticleListCommon :get-articles="getArticles" :title="`分类 ${category.name} 下的文章`" />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ArticleListCommon from '@/components/ArticleListCommon.vue'
import { articleListService } from '@/api/article'
import { categoryGetBySlugService } from '@/api/category'

const route = useRoute()
const slug = ref(route.params.slug)
const getArticles = ref(async (params) => {
  params.categorySlug = slug.value
  return await articleListService(params)
})
const category = ref({})

const getCategory = async () => {
  let result = await categoryGetBySlugService(slug.value)
  category.value = result.data
}

onMounted(() => {
  getCategory()
})

watch(() => route.params.slug, (newSlug) => {
  slug.value = newSlug
  getArticles.value = async (params) => {
    params.categorySlug = newSlug
    return await articleListService(params)
  }
  getCategory()
})
</script>

<style scoped>
.category-header {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}
</style>
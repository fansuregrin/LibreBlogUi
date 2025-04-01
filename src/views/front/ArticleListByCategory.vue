<template>
  <ArticleListCommon 
  v-if="!loading"
    :title="`分类 ${category.name} 下的文章`" 
    :query-params="queryParams"
  />
</template>

<script setup>
import { ref, reactive, watch, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import ArticleListCommon from '@/components/CommonArticleList.vue'
import { categoryGetBySlugService } from '@/api/category'

const route = useRoute()
const loading = ref(true)
const category = ref({})
const queryParams = reactive({})

const getCategory = async () => {
  loading.value = true
  let result = await categoryGetBySlugService(route.params.slug)
  category.value = result.data
  queryParams.categorySlug = category.value.slug
  loading.value = false
}

onBeforeMount(() => {
  getCategory()
})

watch(() => route.params.slug, (newSlug) => {
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
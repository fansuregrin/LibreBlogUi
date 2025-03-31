<template>
  <ArticleListCommon 
    :get-articles="getArticles" 
    :title="`标签 ${tag.name} 的文章`" 
  />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ArticleListCommon from '@/components/ArticleListCommon.vue'
import { articleListService } from '@/api/article'
import { tagGetService } from '@/api/tag'

const route = useRoute()
const slug = ref(route.params.slug)
const getArticles = ref(async (params) => {
  params.tagSlug = slug.value
  return await articleListService(params)
})
const tag = ref({})

const getTag = async () => {
  let result = await tagGetService(route.params.slug)
  tag.value = result.data
}

onMounted(() => {
  getTag()
})

watch(() => route.params.slug, (newSlug) => {
  slug.value = newSlug
  getArticles.value = async (params) => {
    params.tagSlug = newSlug
    return await articleListService(params)
  }
  getTag()
})
</script>
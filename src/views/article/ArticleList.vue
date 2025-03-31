<template>
  <ArticleListCommon :get-articles="getArticles" />
</template>

<script setup>
import { ref } from 'vue'
import ArticleListCommon from '@/components/ArticleListCommon.vue'
import { articleListService } from '@/api/article'

const getArticles = ref(async (params) => {
  return await articleListService(params)
})
</script>
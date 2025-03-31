<template>
  <ArticleListCommon :get-articles="getArticles" :title="`用户 ${user.realname} 的文章`" />
</template>
  
<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ArticleListCommon from '@/components/ArticleListCommon.vue'
import { articleListService } from '@/api/article'
import { userGetService } from '@/api/user'

const route = useRoute()
const id = ref(route.params.id)
const getArticles = ref(async (params) => {
  params.authorId = id.value
  return await articleListService(params)
})
const user = ref({})

const getUser = async () => {
  let result = await userGetService(id.value)
  user.value = result.data
}

onMounted(() => {
  getUser()
})

watch(() => route.params.id, (newId) => {
  id.value = newId
  getArticles.value = async (params) => {
    params.authorId = newId
    return await articleListService(newId, params)
  }
  getUser()
})
</script>

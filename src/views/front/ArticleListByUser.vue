<template>
  <ArticleListCommon 
    v-if="!loading"
    :title="`用户 ${user.realname} 的文章`"
    :query-params="queryParams"
  />
</template>
  
<script setup>
import { ref, reactive, watch, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import ArticleListCommon from '@/components/CommonArticleList.vue'
import { userGetService } from '@/api/user'

const route = useRoute()
const loading = ref(true)
const user = ref({})
const queryParams = reactive({})

const getUser = async () => {
  loading.value = true
  let result = await userGetService(route.params.id)
  user.value = result.data
  queryParams.authorId = user.value.id
  loading.value = false
}

onBeforeMount(() => {
  getUser()
})

watch(() => route.params.id, (newId) => {
  getUser()
})
</script>

<template>
  <ArticleListCommon 
    v-if="!loading"
    :title="`标签 ${tag.name} 的文章`" 
    :query-params="queryParams"
  />
</template>

<script setup>
import { ref, reactive, watch, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import ArticleListCommon from '@/components/CommonArticleList.vue'
import { tagGetService } from '@/api/tag'

const route = useRoute()
const loading = ref(true)
const tag = ref({})
const queryParams = reactive({})

const getTag = async () => {
  loading.value = true
  let result = await tagGetService(route.params.slug)
  tag.value = result.data
  queryParams.tagSlug = tag.value.slug
  loading.value = false
}

onBeforeMount(() => {
  getTag()
})

watch(() => route.params.slug, (newSlug) => {
  getTag()
})
</script>
<template>
  <Manage
    name="文章" menu-code="articleMgr" 
    :table-data="articles" :table-pagintion="articlePagintion"
    :item="article" :clear-item="clearArticle" :get-items="getArticles" 
    :get-item="getArticle" :delete-items="deleteArticles" :update-item="updateArticle"
    :add-item="addArticle"
    :on-page-change="onPageChangeArticle"
    :on-size-change="onSizeChangeArticle"
  >
    <template #tableColumns>
      <el-table-column prop="title" label="标题"/>
      <el-table-column label="作者" width="100">
        <template #default="scope">
            <el-tag>{{ scope.row.author.realname }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="category.name" label="分类" width="100"/>
      <el-table-column label="标签">
        <template #default="scope">
          <el-tag v-for="tag in scope.row.tags" type="info">{{ tag.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160">
        <template #default="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="修改时间" width="160">
        <template #default="scope">
          {{ formatDateTime(scope.row.modifyTime) }}
        </template>
      </el-table-column>
    </template>
    <template #itemFields>
      <el-form :model="article">
        <el-form-item label="标题">
          <el-input v-model="article.title"/>
        </el-form-item>
        <el-form-item label="作者">
          <el-select v-model="article.authorId" filterable 
            @visible-change="onAuthorSelectVisibleChange"
          >
            <el-option 
              v-for="author in authors" 
              :key="author.id" :label="author.realname" :value="author.id" 
            />
            <template #footer>
              <el-pagination size="small" layout="prev,pager,next" 
                v-model:current-page="authorPagination.page"
                :page-size="authorPagination.pageSize"
                :total="authorPagination.total" @current-change="onPageChangeAuthor"
              />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="article.categoryId" filterable 
            @visible-change="onCategorySelectVisibleChange"
          >
            <el-option 
              v-for="c in categories" 
              :key="c.id" :label="c.name" :value="c.id" 
            />
            <template #footer>
              <el-pagination size="small" layout="prev,pager,next" 
                v-model:current-page="categoryPagination.page"
                :page-size="categoryPagination.pageSize"
                :total="categoryPagination.total" @current-change="onPageChangeCategory"
              />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="article.tags"
            multiple
            allow-create
            filterable
            placeholder="为文章添加标签"
            @visible-change="onTagSelectVisibleChange"
          >
            <el-option v-for="tag in tags" :value="tag.name"/>
            <template #footer>
              <el-pagination size="small" layout="prev,pager,next" 
                v-model:current-page="tagPagination.page"
                :page-size="tagPagination.pageSize"
                :total="tagPagination.total" @current-change="onPageChangeTag"
              />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="article.excerpt" type="textarea" :rows="4"/>
        </el-form-item>
        <el-form-item label="内容">
        <MdEditor v-model="article.content" />
      </el-form-item>
      </el-form>
    </template>
  </Manage>
</template>

<script setup>
import { ref, reactive, watch, onBeforeMount } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import {
  articleListAdminService, articleGetService,
  articleUpdateService, articleDeleteService, articleAddService
} from '@/api/article'
import { categoryListService } from '@/api/category'
import { tagListService } from '@/api/tag'
import { userListService } from '@/api/user'
import Manage from '@/components/Manage.vue'
import { PaginationSetting } from '@/utils/pagination'
import { formatDateTime } from '@/utils/date'

const articles = ref([])
const article = ref({})
const articlePagintion = reactive(new PaginationSetting(1, 10, 0, 'default', 7))
const authors = ref([])
const authorPagination = reactive(new PaginationSetting(1, 5, 0, 'default', 5))
const categories = ref([])
const categoryPagination = reactive(new PaginationSetting(1, 5, 0, 'default', 5))
const tags = ref([])
const tagPagination = reactive(new PaginationSetting(1, 5, 0, 'default', 5))

const { width } = useWindowSize()

const setPagination = width => {
  if (width < 768) {
    articlePagintion.size = 'small'
    articlePagintion.pagerCount = 5
  } else {
    articlePagintion.size = 'default'
    articlePagintion.pagerCount = 7
  }
}

watch(width, setPagination)

const getArticles = async () => {
  let params = {
    page: articlePagintion.page,
    pageSize: articlePagintion.pageSize
  }
  let result = await articleListAdminService(params)
  articles.value = result.data.items
  articlePagintion.total = result.data.total
}

const getArticle = async (id) => {
  let result = await articleGetService(id)
  article.value = result.data
  authors.value = [article.value.author]
  categories.value = [article.value.category]
  article.value.tags = article.value.tags.map((t) => t.name)
}

const addArticle = async (article) => {
  await articleAddService(article)
}

const updateArticle = async (article) => {
  await articleUpdateService(article)
}

const deleteArticles = async (ids) => {
  await articleDeleteService(ids)
}

const onPageChangeArticle = async (page) => {
  await getArticles()
}

const onSizeChangeArticle = async (size) => {
  await getArticles()
}

const getAuthors = async () => {
  let params = {
    page: authorPagination.page,
    pageSize: authorPagination.pageSize
  }
  let result = await userListService(params)
  authorPagination.total = result.data.total
  authors.value = result.data.items
}

const onPageChangeAuthor = async (page) => {
  await getAuthors()
}

const onAuthorSelectVisibleChange = async (visible) => {
  if (visible) {
    await getAuthors()
  } else {
    authorPagination.page = 1
  }
}

const getCategories = async () => {
  let params = {
    page: categoryPagination.page,
    pageSize: categoryPagination.pageSize
  }
  let result = await categoryListService(params)
  categories.value = result.data.items
  categoryPagination.total = result.data.total
}

const onPageChangeCategory = async (page) => {
  await getCategories()
}

const onCategorySelectVisibleChange = async (visible) => {
  if (visible) {
    await getCategories()
  } else {
    categoryPagination.page = 1
  }
}

const getTags = async () => {
  let params = {
    page: tagPagination.page,
    pageSize: tagPagination.pageSize
  }
  let result = await tagListService(params)
  tagPagination.total = result.data.total
  tags.value = result.data.items
}

const onPageChangeTag = async (page) => {
  await getTags()
}

const onTagSelectVisibleChange = async (visible) => {
  if (visible) {
    await getTags()
  } else {
    tagPagination.page = 1
  }
}

const clearArticle = () => {
  article.value = {}
}

onBeforeMount(() => {
  setPagination(width.value)
})

</script>
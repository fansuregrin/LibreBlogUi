<template>
  <Manage
    name="文章" menu-code="articleMgr" 
    :table-data="articles" :total="total" :item="article" 
    :on-create="onCreate" :on-edit="onEdit" :on-dialog-close="onDialogClose"
    :get-items="getArticles" :delete-items="deleteArticles" 
    :update-item="updateArticle" :add-item="addArticle"
    :check-data-scope="checkDataScope"
  >
    <template #tableColumns>
      <el-table-column prop="title" label="标题"/>
      <el-table-column label="作者">
        <template #default="scope">
            <el-tag>{{ scope.row.author?.realname }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="category.name" label="分类"/>
      <el-table-column label="标签">
        <template #default="scope">
          <el-tag v-for="tag in scope.row.tags" type="info">{{ tag.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间">
        <template #default="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="修改时间">
        <template #default="scope">
          {{ formatDateTime(scope.row.modifyTime) }}
        </template>
      </el-table-column>
    </template>
    <template #itemFields>
      <el-form :model="article" label-position="right" label-width="auto"
        :ref="articleFormRef" :rules="rules" v-loading="articleLoading"
        :validate-on-rule-change="false"
      >
        <el-form-item label="标题">
          <el-input v-model="article.title" style="width: 600px;"/>
        </el-form-item>
        <el-form-item label="作者">
          <el-select v-model="article.authorId" filterable 
            @visible-change="onAuthorSelectVisibleChange"
            style="width: 200px;"
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
            style="width: 200px;"
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
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="3"
            placeholder="为文章添加标签"
            @visible-change="onTagSelectVisibleChange"
            style="width: 200px;"
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
import { ref, reactive, useTemplateRef } from 'vue'
import { AxiosError } from 'axios'
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
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const articles = ref([])
const total = ref(0)
const article = ref({})
const articleFormRef = useTemplateRef('articleFormRef')
const articleLoading = ref(true)
const authors = ref([])
const authorPagination = reactive(new PaginationSetting(1, 5, 0, 'default', 5))
const categories = ref([])
const categoryPagination = reactive(new PaginationSetting(1, 5, 0, 'default', 5))
const tags = ref([])
const tagPagination = reactive(new PaginationSetting(1, 5, 0, 'default', 5))
const userStore = useUserStore()

const rules = {}

const onCreate = () => {
  articleLoading.value = true
  article.value = {}
  article.value.authorId = userStore.user.id
  authors.value = [{ id: userStore.user.id, realname: userStore.user.realname }]
  articleLoading.value = false
}

const onEdit = async (row) => {
  articleLoading.value = true
  
  try {
    let result = await articleGetService(row.id)
    article.value = result.data
    authors.value = [article.value.author]
    categories.value = [article.value.category]
    article.value.tags = article.value.tags.map((t) => t.name)
    articleLoading.value = false
  } catch (error) {
    if (error instanceof AxiosError) {
      console.debug(error.response.data?.msg)
    }
    ElMessage.error('获取文章失败')
  }
}

const onDialogClose = () => {
  if (articleFormRef.value) {
    articleFormRef.value.clearValidate()
  }
}

const checkDataScope = (row) => {
  return row.authorId === userStore.user.id;
}

const getArticles = async (params) => {
  try {
    let result = await articleListAdminService(params)
    articles.value = result.data.items
    total.value = result.data.total
  } catch (error) {
    if (error instanceof AxiosError) {
      console.debug(error.response.data?.msg)
    }
    ElMessage.error('获取文章列表失败')
  }
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

const getAuthors = async () => {
  let params = {
    page: authorPagination.page,
    pageSize: authorPagination.pageSize
  }
  try {
    let result = await userListService(params)
    authorPagination.total = result.data.total
    authors.value = result.data.items
  } catch (error) {
    if (error instanceof AxiosError) {
      console.debug(error.response.data?.msg)
    }
    ElMessage.error('获取作者列表失败')
  }
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
  try {
    let result = await categoryListService(params)
    categories.value = result.data.items
    categoryPagination.total = result.data.total
  } catch (error) {
    if (error instanceof AxiosError) {
      console.debug(error.response.data?.msg)
    }
    ElMessage.error('获取分类列表失败')
  }
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
  try {
    let result = await tagListService(params)
    tagPagination.total = result.data.total
    tags.value = result.data.items
  } catch (error) {
    if (error instanceof AxiosError) {
      console.debug(error.response.data?.msg)
    }
    ElMessage.error('获取标签列表失败')
  }
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

</script>

<style scoped>
.el-tag {
  margin-right: 5px;
}
</style>
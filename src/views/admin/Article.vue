<template>
  <div class="management-container">
    <div class="header-area">
      <h2>文章管理</h2>
      <div>
        <el-button :disabled="!menus.create" type="primary" @click="handleCreate">新增</el-button>
        <el-button :disabled="!menus.delete" type="danger" @click="handleDeleteMultiple">删除</el-button>
      </div>
    </div>
    <el-table ref="table" v-loading="loading" :data="articles" 
      @selection-change="onSelectionChange" class="table-area"
    >
      <el-table-column v-if="menus.delete" type="selection" width="30"/>
      <el-table-column type="index" label="序号" width="60"/>
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
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button 
            :disabled="!menus.update" type="primary" size="small" circle :icon="Edit" 
            @click="handleEdit(scope.$index, scope.row)" 
          />
          <el-button
            :disabled="!menus.delete" size="small" type="danger" circle :icon="Delete"
            @click="handleDelete(scope.$index, scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>
    <el-pagination 
      class="pagination-area"
      background
      v-model:size="articlePagintion.size"
      v-model:pager-count="articlePagintion.pagerCount"
      hide-on-single-page
      layout="prev,pager,next,jumper,total,sizes"
      v-model:current-page="articlePagintion.page"
      v-model:page-size="articlePagintion.pageSize"
      :total="articlePagintion.total"
      :page-sizes="[5,10,20,30]"
      @current-change="onPageChangeArticle"
      @size-change="onSizeChangeArticle"
    />
  </div>
  <el-dialog v-model="dialog.visible" :title="dialog.title" fullscreen>
    <el-form :model="article" v-if="!loading">
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
        <md-editor v-model="article.content" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitArticle">提交</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onBeforeMount } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
import { menuSelfListService } from '@/api/menu'
import { formatDateTime } from '@/utils/date'

const { width } = useWindowSize()
const setPagination = width => {
  if (width < 768) {
    articlePagintion.value.size = 'small'
    articlePagintion.value.pagerCount = 5
  } else {
    articlePagintion.value.size = 'default'
    articlePagintion.value.pagerCount = 7
  }
}

watch(width, setPagination)

onBeforeMount(() => {
  setPagination(width.value)
})

const table = ref()
const loading = ref(true)
const articles = ref([])
const article = ref({})
const authors = ref([])
const categories = ref([])
const tags = ref([])
const dialog = ref({
  type: null,
  title: '',
  visible: false
})
const selectedArticleIds = ref([])

const articlePagintion = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  size: 'default',
  pagerCount: 7
})

const authorPagination = ref({
  page: 1,
  pageSize: 5,
  total: 0
})

const tagPagination = ref({
  page: 1,
  pageSize: 5,
  total: 0
})

const categoryPagination = ref({
  page: 1,
  pageSize: 5,
  total: 0
})

const menus = ref({
  list: false,
  get: false,
  create: false,
  update: false,
  delete: false,
})

const setupMenus = async () => {
  let params = { code: 'articleMgr' }
  let result = await menuSelfListService(params)
  for (let m of result.data) {
    menus.value.list = menus.value.list || (m.code === 'articleMgr:list')
    menus.value.get = menus.value.get || (m.code === 'articleMgr:get')
    menus.value.create = menus.value.create || (m.code === 'articleMgr:create')
    menus.value.update = menus.value.update || (m.code === 'articleMgr:update')
    menus.value.delete = menus.value.delete || (m.code === 'articleMgr:delete')
  }
}

const articleSelfList = async () => {
  loading.value = true
  let params = {
    page: articlePagintion.value.page,
    pageSize: articlePagintion.value.pageSize
  }
  let result = await articleListAdminService(params)
  articles.value = result.data.items
  articlePagintion.value.total = result.data.total
  loading.value = false
}

const getArticle = async (id) => {
  let result = await articleGetService(id)
  article.value = result.data
}

const onPageChangeArticle = async (page) => {
  await articleSelfList()
}

const onSizeChangeArticle = async (size) => {
  await articleSelfList()
}

const onSelectionChange = (rows) => {
  selectedArticleIds.value = rows.map((r) => r.id)
  console.log(`selected article ids: ${selectedArticleIds.value}`)
}

const getAuthors = async () => {
  let params = {
    page: authorPagination.value.page,
    pageSize: authorPagination.value.pageSize
  }
  let result = await userListService(params)
  authorPagination.value.total = result.data.total
  authors.value = result.data.items
}

const onPageChangeAuthor = async (page) => {
  await getAuthors()
}

const onAuthorSelectVisibleChange = async (visible) => {
  if (visible) {
    await getAuthors()
  } else {
    authorPagination.value.page = 1
  }
}

const getCategories = async () => {
  let params = {
    page: categoryPagination.value.page,
    pageSize: categoryPagination.value.pageSize
  }
  let result = await categoryListService(params)
  categories.value = result.data.items
  categoryPagination.value.total = result.data.total
}

const onPageChangeCategory = async (page) => {
  await getCategories()
}

const onCategorySelectVisibleChange = async (visible) => {
  if (visible) {
    await getCategories()
  } else {
    categoryPagination.value.page = 1
  }
}

const getTags = async () => {
  let params = {
    page: tagPagination.value.page,
    pageSize: tagPagination.value.pageSize
  }
  let result = await tagListService(params)
  tagPagination.value.total = result.data.total
  tags.value = result.data.items
}

const onPageChangeTag = async (page) => {
  await getTags()
}

const onTagSelectVisibleChange = async (visible) => {
  if (visible) {
    await getTags()
  } else {
    tagPagination.value.page = 1
  }
}

const deleteArticles = (ids) => {
  if (!(ids instanceof Array)) return
  if (ids.length <= 0) {
    ElMessage.warning('请先选择要删除的文章！')
    return
  }
  ElMessageBox.confirm(
    '系统将删除所选文章。继续？',
    '温馨提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    await articleDeleteService(ids)
    ElMessage.success('删除成功')
    await articleSelfList()
  }).catch(error => {
    if (error instanceof AxiosError) {
      ElMessage.warning('删除失败')
    } else if(error === 'cancel') {
      ElMessage.info('用户取消了删除')
    }
  })
}

const handleCreate = () => {
  dialog.value.title = '新增文章'
  dialog.value.type = 'create'
  dialog.value.visible = false
  article.value = {}
  dialog.value.visible = true
}

const handleEdit = async (index, row) => {
  dialog.value.title = '编辑文章'
  dialog.value.type = 'edit'
  dialog.value.visible = false
  loading.value = true
  await getArticle(row.id)
  authors.value = [article.value.author]
  categories.value = [article.value.category]
  article.value.tags = article.value.tags.map((t) => t.name)
  loading.value = false
  dialog.value.visible = true
}

const handleDelete = (index, row) => {
  deleteArticles([row.id])
}

const handleDeleteMultiple = () => {
  deleteArticles(selectedArticleIds.value)
}

const submitArticle = async () => {
  let type = dialog.value.type
  if (type === 'edit') {
    await articleUpdateService(article.value)
    .then(result => {
      ElMessage.success('更新成功')
    })
    .catch(error => {
      console.log(error.response.data.msg)
      ElMessage.error('更新失败')
    })
  } else if (type === 'create') {
    await articleAddService(article.value)
    .then(result => {
      ElMessage.success('添加成功')
    })
    .catch(error => {
      console.log(error.response.data.msg)
      ElMessage.error('添加失败')
    })
  }
  dialog.value.visible = false
  await articleSelfList()
}

onBeforeMount(async () => {
  await setupMenus()
  if (menus.value.list) {
    await articleSelfList()
  } else {
    ElMessageBox.alert('没有权限获取文章列表', '温馨提示', { type: 'warning' })
  }
})

</script>

<style scoped>
.management-container {
  margin: auto 20px;
  display: flex;
  flex-direction: column;

  .header-area {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 45px;
    margin-top: 10px;
    padding: 0px 20px;
    background-color: rgb(255, 255, 255);
    border-radius: 5px;
  }

  .table-area {
    margin-top: 20px;
    border-radius: 5px;

    .el-tag {
      margin: auto 5px;
    }
  }
  
  .pagination-area {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px;
  }
}

</style>
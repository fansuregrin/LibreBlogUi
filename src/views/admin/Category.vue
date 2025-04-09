<template>
  <Manage name="分类" menu-code="categoryMgr" :fullscreen-dialog="false"
    :table-data="categories" :total="total" :item="category"
    :on-edit="onEdit" :on-create="onCreate" :on-dialog-close="onDialogClose"
    :get-items="getCategories" :add-item="categoryAddService"
    :update-item="categoryUpdateService" :delete-items="categoryDeleteService"
    :beforeSubmitItem="validateCategoryForm"
  >
    <template #tableColumns>
      <el-table-column prop="name" label="名称"/>
      <el-table-column prop="slug" label="缩略名"/>
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
      <el-form :model="category" label-position="right" label-width="auto"
        :rules="rules" ref="categoryFormRef" v-loading="categoryLoading"
        :validate-on-rule-change="false"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="category.name" style="width: 200px;"/>
        </el-form-item>
        <el-form-item label="缩略名" prop="slug">
          <el-input v-model="category.slug" style="width: 200px;"/>
        </el-form-item>
      </el-form>
    </template>
  </Manage>
</template>

<script setup>
import { ref, useTemplateRef } from 'vue'
import { ElMessage } from 'element-plus'
import Manage from '@/components/Manage.vue'
import {
  categoryListService, categoryGetService, categoryAddService,
  categoryUpdateService, categoryDeleteService
} from '@/api/category'
import { formatDateTime } from '@/utils/date'

const categories = ref([])
const total = ref(0)
const category = ref({})
const categoryFormRef = useTemplateRef('categoryFormRef')
const categoryLoading = ref(true)

const rules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' }
  ],
  slug: [
    { required: true, message: '请输入缩略名', trigger: 'blur' }
  ]
}

const onCreate = () => {
  categoryLoading.value = true
  category.value = {}
  categoryLoading.value = false
}

const onEdit = async (row) => {
  categoryLoading.value = true
  let result = await categoryGetService(row.id)
  category.value = result.data
  categoryLoading.value = false
}

const onDialogClose = () => {
  if (categoryFormRef.value) {
    categoryFormRef.value.clearValidate()
  }
}

const getCategories = async (params) => {
  let result = await categoryListService(params)
  categories.value = result.data.items
  total.value = result.data.total
}

const validateCategoryForm = async () => {
  try {
    await categoryFormRef.value.validate()
    return true
  } catch (error) {
    ElMessage.warning('请正确填写分类信息')
    return false
  }
}

</script>
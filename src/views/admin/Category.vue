<template>
  <Manage name="分类" menu-code="categoryMgr"
    :table-data="categories" :total="total" :item="category"
    :on-update="onUpdate" :on-create="onCreate"
    :get-items="getCategories" :get-item="getCategory" :add-item="addCategory"
    :update-item="updateCategory" :delete-items="deleteCategoires"
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
      <el-form :model="category">
        <el-form-item label="名称">
          <el-input v-model="category.name"/>
        </el-form-item>
        <el-form-item label="缩略名">
          <el-input v-model="category.slug"/>
        </el-form-item>
      </el-form>
    </template>
  </Manage>
</template>

<script setup>
import { ref } from 'vue'
import Manage from '@/components/Manage.vue'
import {
  categoryListService, categoryGetService, categoryAddService,
  categoryUpdateService, categoryDeleteService
} from '@/api/category'
import { formatDateTime } from '@/utils/date'

const categories = ref([])
const total = ref(0)
const category = ref({})

const getCategories = async (params) => {
  let result = await categoryListService(params)
  categories.value = result.data.items
  total.value = result.data.total
}

const getCategory = async (id) => {
  let result = await categoryGetService(id)
  category.value = result.data
}

const onUpdate = () => {
  category.value = {}
}

const onCreate = () => {
  category.value = {}
}

const addCategory = async (category) => {
  await categoryAddService(category)
}

const updateCategory = async (category) => {
  await categoryUpdateService(category)
}

const deleteCategoires = async (ids) => {
  await categoryDeleteService(ids)
}

</script>
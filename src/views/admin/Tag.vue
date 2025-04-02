<template>
<Manage name="标签" menu-code="tagMgr" :fullscreen-dialog="false"
    :table-data="tags" :total="total" :item="tag"
    :on-edit="onEdit" :on-create="onCreate" :on-dialog-close="onDialogClose"
    :get-items="getTags" :add-item="addTag"
    :update-item="updateTag" :delete-items="deleteTags"
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
      <el-form :model="tag" label-position="right" label-width="auto"
        :rules="rules" ref="tagFormRef" :v-loading="tagLoading"
        :validate-on-rule-change="false"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="tag.name" style="width: 200px;"/>
        </el-form-item>
        <el-form-item label="缩略名" prop="slug">
          <el-input v-model="tag.slug" style="width: 200px;"/>
        </el-form-item>
      </el-form>
    </template>
  </Manage>
</template>

<script setup>
import { ref, useTemplateRef } from 'vue'
import Manage from '@/components/Manage.vue'
import { formatDateTime } from '@/utils/date'
import {
  tagListService, tagAddService, tagGetService, 
  tagUpdateService, tagDeleteService
} from '@/api/tag'

const tags = ref([])
const total = ref(0)
const tag = ref({})
const tagFormRef = useTemplateRef('tagFormRef')
const tagLoading = ref(true)

const rules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' }
  ],
  slug: [
    { required: true, message: '请输入缩略名', trigger: 'blur' }
  ]
}

const onCreate = () => {
  tagLoading.value = true
  tag.value = {}
  tagLoading.value = false
}

const onEdit = async (row) => {
  tagLoading.value = true
  let result = await tagGetService(row.id)
  tag.value = result.data
  tagLoading.value = false
}

const onDialogClose = () => {
  if (tagFormRef.value) {
    tagFormRef.value.clearValidate()
  }
}

const getTags = async (params) => {
  let result = await tagListService(params)
  tags.value = result.data.items
  total.value = result.data.total
}

const addTag = async (tag) => {
  await tagAddService(tag)
}

const updateTag = async (tag) => {
  await tagUpdateService(tag)
}

const deleteTags = async (ids) => {
  await tagDeleteService(ids)
}

</script>
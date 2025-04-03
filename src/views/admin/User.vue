<template>
  <Manage name="用户" menu-code="userMgr" :fullscreen-dialog="false"
    :table-data="users" :total="total" :item="user"
    :on-edit="onEdit" :on-create="onCreate" :on-dialog-close="onDialogClose"
    :get-items="getUsers" :add-item="addUser"
    :update-item="updateUser" :delete-items="deleteUsers"
    :check-data-scope="checkDataScope"
  >
    <template #tableColumns>
      <el-table-column prop="username" label="用户名"/>
      <el-table-column prop="realname" label="姓名"/>
      <el-table-column label="角色">
        <template #default="scope">
            <el-tag>{{ scope.row.role.name }}</el-tag>
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
      <el-form :model="user" label-position="right" label-width="auto"
        :rules="rules" ref="userFormRef" v-loading="userLoading"
        :validate-on-rule-change="false"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="user.username" style="width: 200px;"/>
        </el-form-item>
        <el-form-item label="姓名" prop="realname">
          <el-input v-model="user.realname" style="width: 200px;"/>
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="user.email" style="width: 200px;"/>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="user.roleId" filterable 
            @visible-change="onRoleSelectVisibleChange"
            style="width: 200px;"
          >
            <el-option 
              v-for="role in roles" 
              :key="role.id" :label="role.name" :value="role.id" 
            />
            <template #footer>
              <el-pagination size="small" layout="prev,pager,next" 
                v-model:current-page="rolePagination.page"
                hide-on-single-page
                :page-size="rolePagination.pageSize"
                :total="rolePagination.total" @current-change="onPageChangeRole"
              />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="passwordFormItem">
          <el-input v-model="user.password" type="password" show-password 
            style="width: 200px;"
          />
        </el-form-item>
      </el-form>
    </template>
  </Manage>
</template>

<script setup>
import { ref, reactive, useTemplateRef } from 'vue'
import Manage from '@/components/Manage.vue'
import { formatDateTime } from '@/utils/date'
import {
  userListService, userAddService, userGetService, 
  userUpdateService, userDeleteService
} from '@/api/user'
import { roleListService } from '@/api/role'
import { PaginationSetting } from '@/utils/pagination'
import { validateUsername, validateEmail, validatePassword } from '@/utils/validate'
import { useUserStore } from '@/stores/user'

const users = ref([])
const user = ref({})
const total = ref(0)
const userFormRef = useTemplateRef('userFormRef')
const rolePagination = reactive(new PaginationSetting(1, 5, 0, 'default', 5))
const roles = ref([])
const passwordFormItem = ref(false)
const userLoading = ref(true)
const rules = ref(null)

const userStore = useUserStore()

const onCreate = () => {
  userLoading.value = true
  user.value = {}
  rules.value = rulesCreate
  passwordFormItem.value = true
  userLoading.value = false
}

const onEdit = async (row) => {
  userLoading.value = true
  let result = await userGetService(row.id)
  user.value = result.data
  roles.value = [result.data.role]
  rules.value = rulesUpdate
  passwordFormItem.value = false
  userLoading.value = false
}

const onDialogClose = () => {
  if (userFormRef.value) {
    userFormRef.value.clearValidate()
  }
}

const checkDataScope = (row) => {
  return row.id === userStore.user.id
}

const rulesCreate = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur'},
    { validator: validateUsername, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur'},
    { validator: validateEmail, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur'},
    { validator: validatePassword, trigger: 'blur' }
  ]
}

const rulesUpdate = {
  username: [
    { validator: validateUsername, trigger: 'blur' }
  ],
  email: [
    { validator: validateEmail, trigger: 'blur' }
  ]
}

const getUsers = async (params) => {
  let result = await userListService(params)
  users.value = result.data.items
  total.value = result.data.total
}

const addUser = async (user) => {
  await userAddService(user)
}

const updateUser = async (user) => {
  await userUpdateService(user)
}

const deleteUsers = async (ids) => {
  await userDeleteService(ids)
}

const getRoles = async () => {
  let params = {
    page: rolePagination.page,
    pageSize: rolePagination.pageSize
  }
  let result = await roleListService(params)
  roles.value = result.data.items
  rolePagination.total = result.data.total
}

const onRoleSelectVisibleChange = async (visible) => {
  if (visible) {
    await getRoles()
  } else {
    rolePagination.page = 1
  }
}

const onPageChangeRole = async () => {
  await getRoles()
}

</script>
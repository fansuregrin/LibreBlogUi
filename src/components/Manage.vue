<template>
  <div class="management-container">
    <div class="header-area">
      <h2>{{ `管理${props.name}` }}</h2>
      <div>
        <el-button :disabled="!canCreate()" type="primary" @click="handleCreate">
          新增
        </el-button>
        <el-button :disabled="!menus.has(`${props.menuCode}:delete`)" type="danger" 
          @click="handleDeleteMultiple"
        >
          删除
        </el-button>
      </div>
    </div>
    <el-table ref="table" v-loading="tableLoading" :data="props.tableData"
      @selection-change="onSelectionChange" class="table-area"
    >
      <el-table-column :selectable="canDelete" type="selection" width="30"/>
      <el-table-column type="index" label="序号" width="60"/>
      <slot name="tableColumns"></slot>
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button 
            :disabled="!canEdit(scope.row)" type="primary" size="small" 
            circle :icon="Edit" @click="handleEdit(scope.row)"
          />
          <el-button
            :disabled="!canDelete(scope.row)" size="small" type="danger" 
            circle :icon="Delete" @click="handleDelete(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>
    <el-pagination 
      class="pagination-area"
      background
      v-model:size="tablePagintion.size"
      v-model:pager-count="tablePagintion.pagerCount"
      hide-on-single-page
      layout="prev,pager,next,jumper,total,sizes"
      v-model:current-page="tablePagintion.page"
      v-model:page-size="tablePagintion.pageSize"
      :total="tablePagintion.total"
      :page-sizes="[5,10,20,30]"
      @current-change="onPageChange"
      @size-change="onSizeChange"
    />
  </div>
  <el-dialog v-model="dialog.visible" :title="dialog.title" 
    :fullscreen="props.fullscreenDialog" :width="dialog.width"
    @close="props.onDialogClose"
  >
    <slot name="itemFields"></slot>
    <el-button type="primary" @click="submitItem">提交</el-button>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, onBeforeMount } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useWindowSize } from '@vueuse/core'
import { AxiosError } from 'axios'
import { PaginationSetting } from '@/utils/pagination'
import { menuSelfListService } from '@/api/menu'

const props = defineProps({
  name: String,
  menuCode: String,
  tableData: {
    type: Array,
    default: []
  },
  total: {
    type: Number,
    default: 0
  },
  item: {
    type: Object,
    default: {}
  },
  getItems: Function,
  addItem: Function,
  updateItem: Function,
  deleteItems: Function,
  onCreate: {
    type: Function,
    default: () => {}
  },
  onEdit:  {
    type: Function,
    default: () => {}
  },
  beforeSubmitItem: {
    type: Function,
    default: () => { return true }
  },
  fullscreenDialog: {
    type: Boolean,
    default: true
  },
  onDialogClose: {
    type: Function,
    default: () => {}
  },
  checkDataScope: {
    type: Function,
    default: (row) => false
  }
})

const table = ref()
const tableLoading = ref(true)
const dialog = ref({
  type: null,
  title: '',
  visible: false,
  width: '50%'
})
const selectedItemIds = ref([])
const menus = reactive(new Map())
const tablePagintion = reactive(new PaginationSetting(1, 10, 0, 'default', 7))

const { width } = useWindowSize()

const screeAdaptation = (width) => {
  if (width < 768) {
    tablePagintion.size = 'small'
    tablePagintion.pagerCount = 5
    dialog.value.width = '95%'
  } else {
    tablePagintion.size = 'default'
    tablePagintion.pagerCount = 7
    dialog.value.width = '50%'
  }
}

watch(width, screeAdaptation)

const setupMenus = async () => {
  let code = props.menuCode
  let params = { code: code }
  let result = await menuSelfListService(params)
  for (let m of result.data) {
    menus.set(m.code, m)
  }
}

const getItems = async () => {
  let params = {
    page: tablePagintion.page,
    pageSize: tablePagintion.pageSize
  }  
  await props.getItems(params)
  tablePagintion.total = props.total
}

const onPageChange = async () => {
  await getItems()
}

const onSizeChange = async () => {
  await getItems()
}

const onSelectionChange = (rows) => {
  selectedItemIds.value = rows.map((r) => r.id)
}

const deleteItems = (ids) => {
  if (!(ids instanceof Array)) return
  if (ids.length <= 0) {
    ElMessage.warning(`请先选择要删除的${props.name}！`)
    return
  }
  
  ElMessageBox.confirm(
    `系统将删除所选${props.name}。继续？`,
    '温馨提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await props.deleteItems(ids)
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.warning('删除失败')
    } finally {
      await getItems()
    }
  }).catch(error => {
    ElMessage.info('用户取消了删除')
  })
}

const handleCreate = async () => {
  dialog.value.visible = false
  dialog.value.title = `新增${props.name}`
  dialog.value.type = 'create'
  dialog.value.visible = true
  await props.onCreate()
}

const handleEdit = async (row) => {
  dialog.value.visible = false
  dialog.value.title = `编辑${props.name}`
  dialog.value.type = 'edit'
  dialog.value.visible = true
  await props.onEdit(row)
}

const handleDelete = (row) => {
  deleteItems([row.id])
}

const handleDeleteMultiple = () => {
  deleteItems(selectedItemIds.value)
}

const submitItem = async () => {
  let isValid = await props.beforeSubmitItem()
  if (!isValid) {
    return
  }
  
  let type = dialog.value.type
  if (type === 'edit') {
    try {
      await props.updateItem(props.item)
      ElMessage.success('更新成功')
    } catch (error) {
      if (error instanceof AxiosError) {
        console.debug(error.response.data?.msg)
      }
      ElMessage.error('更新失败')
    }
  } else if (type === 'create') {
    try {
      await props.addItem(props.item)
      ElMessage.success('添加成功')
    } catch (error) {
      if (error instanceof AxiosError) {
        console.debug(error.response.data?.msg)
      }
      ElMessage.error('添加失败')
    }
  }
  dialog.value.visible = false

  tableLoading.value = true
  await getItems()
  tableLoading.value = false
}

onBeforeMount(async () => {
  screeAdaptation(width.value)
  await setupMenus()
  if (menus.has(`${props.menuCode}:list`)) {
    tableLoading.value = true
    await getItems()
    tableLoading.value = false
  } else {
    ElMessageBox.alert(`没有权限获取${props.name}列表`, '温馨提示', { type: 'warning' })
  }
})

const canCreate = () => {
  let code = `${props.menuCode}:create`
  return menus.has(code)
}

const canEdit = (row) => {
  let code = `${props.menuCode}:update`
  if (menus.has(code)) {
    let m = menus.get(code)
    return m.scope === 1 ? props.checkDataScope(row) : true
  } else {
    return false
  }
}

const canDelete = (row) => {
  let code = `${props.menuCode}:delete`
  if (menus.has(code)) {
    let m = menus.get(code)
    return m.scope === 1 ? props.checkDataScope(row) : true
  } else {
    return false
  }
}

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
import { ElMessage, ElMessageBox } from "element-plus"
import { useRouter } from "vue-router"
import { useUserStore } from "@/stores/user"
import { useTokenStore } from "@/stores/token"
import { userLogoutService } from "@/api/user"

export const useLogout = () => {
  const router = useRouter()
  const userStore = useUserStore()
  const tokenStore = useTokenStore()

  const logout = (onSuccess) => {
    ElMessageBox.confirm(
      '您确定退出登录吗？',
      '温馨提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    .then(async () => {
      await userLogoutService()
      .then(() => {
          tokenStore.removeToken()
          userStore.removeUser()
          ElMessage.success('登出成功')
          onSuccess()
        })
        .catch((error) => {

        })
    })
    .catch((error) => {
      
    })
  }

  return logout
}

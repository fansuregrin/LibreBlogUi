import axios from "axios"
import { ElMessage } from "element-plus"
import { useTokenStore } from "@/stores/token"
import router from "@/router"

const baseURL = '/api'
const instance = axios.create({baseURL})

instance.interceptors.response.use(
  result => {
    if (result.data.code === 0) {
      return result.data
    }

    console.debug(result.data.msg)
    ElMessage.error('服务异常')
    return Promise.reject(result.data)
  },
  error => {
    const response = error.response
    const tokenStore = useTokenStore()
    if (response.status === 401) {
      console.debug(response.data?.msg)
      tokenStore.removeToken()
      ElMessage.error('请先登录')
      router.push('/auth')
    }
    return Promise.reject(error)
  }
)

instance.interceptors.request.use(
  config => {
    const tokenStore = useTokenStore()
    if (tokenStore.token) {
      config.headers.Authorization = 'Bearer ' + tokenStore.token
    }
    return config
  },
  error => {
    Promise.reject(error)
  }
)

export default instance

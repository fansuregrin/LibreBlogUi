import request from '@/utils/request'

export const roleListService = (params) => {
  return request.get('/admin/roles/list', { params: params })
}
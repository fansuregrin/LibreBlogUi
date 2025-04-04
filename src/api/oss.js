import request from '@/utils/request'

export const uploadService = (file) => {
  let data = new FormData()
  data.append('file', file)
  return request.post('/admin/upload', data)
}
import request from '@/utils/request'

export const categoryListAllService = () => {
  return request.get('/categories/all')
}

export const categoryListService = (params) => {
  return request.get('/admin/categories/list', { params: params })
}

export const categoryGetBySlugService = (slug) => {
  return request.get(`/categories/slug/${slug}`)
}
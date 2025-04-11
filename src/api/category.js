import request from '@/utils/request'

export const categoryListAllService = () => {
  return request.get('/categories/all')
}

export const categoryListService = (params) => {
  return request.get('/admin/categories/list', { params: params })
}

export const categoryGetService = (id) => {
  return request.get(`/categories/id/${id}`)
}

export const categoryGetBySlugService = (slug) => {
  return request.get(`/categories/slug/${slug}`)
}

export const categoryAddService = (category) => {
  return request.post('/admin/categories', category)
}

export const categoryUpdateService = (category) => {
  return request.put('/admin/categories', category)
}

export const categoryDeleteService = (ids) => {
  return request.delete('/admin/categories', {
    headers: {
      "Content-Type": "application/json"
    },
    data: ids
  })
}

export const categoryArticleCountService = () => {
  return request.get('/admin/categories/article-count')
}
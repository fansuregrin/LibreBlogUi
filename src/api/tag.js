import request from '@/utils/request'

export const tagGetBySlugService = (slug) => {
  return request.get(`/tags/slug/${slug}`)
}

export const tagGetService = (id) => {
  return request.get(`/tags/id/${id}`)
}

export const tagListService = (params) => {
  return request.get('/admin/tags/list', { params: params })
}

export const tagAddService = (tag) => {
  return request.post('/admin/tags', tag)
}

export const tagUpdateService = (tag) => {
  return request.put('/admin/tags', tag)
}

export const tagDeleteService = (ids) => {
  return request.delete('/admin/tags', {
    headers: {
      "Content-Type": "application/json"
    },
    data: ids
  })
}
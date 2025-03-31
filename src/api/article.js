import request from '@/utils/request'

export const articleListService = (params) => {
  return request.get('/articles/list', { params: params })
}

export const articleListAdminService = (params) => {
  return request.get('/admin/articles/list', { params: params })
}

export const articleGetService = (id) => {
  return request.get(`/articles/${id}`)
}

export const articleAddService = (article) => {
  return request.post('/admin/articles', article)
}

export const articleUpdateService = (article) => {
  return request.put('/admin/articles', article)
}

export const articleDeleteService = (ids) => {
  return request.delete('/admin/articles', {
    headers: {
      "Content-Type": "application/json"
    },
    data: ids
  })
}
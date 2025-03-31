import request from '@/utils/request'

export const tagGetService = (slug) => {
    return request.get(`/tags/slug/${slug}`)
}

export const tagListService = (params) => {
    return request.get('/admin/tags/list', { params: params })
}
import request from '@/utils/request'

export const menuSelfListService = (params) => {
    return request.get('/admin/menus/me', { params: params })
}
import request from '@/utils/request'

export const dashboardStatsService = () => {
  return request.get('/admin/dashboard/stats')
}
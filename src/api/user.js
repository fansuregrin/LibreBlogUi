import request from '@/utils/request'

export const userLoginService = (loginData) => {
  return request.post('/login', loginData, {
    headers: {
      'Content-Type': "application/json"
    }
  })
}

export const userRegisterService = (registerData) => {
  return request.post('/register', registerData, {
    headers: {
      'Content-Type': "application/json"
    }
  })
}

export const userGetService = (id) => {
  return request.get(`/users/${id}`)
}

export const userListService = (params) => {
  return request.get('/admin/users/list', { params: params })
}

export const userSelfGetService = () => {
  return request.get('/admin/users/me')
}
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

export const userAddService = (user) => {
  return request.post('/admin/users', user)
}

export const userUpdateService = (user) => {
  return request.patch('/admin/users', user)
}

export const userDeleteService = (ids) => {
  return request.delete('/admin/users', {
    headers: {
      "Content-Type": "application/json"
    },
    data: ids
  })
}
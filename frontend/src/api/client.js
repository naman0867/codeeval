// src/api/client.js
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('codeeval-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

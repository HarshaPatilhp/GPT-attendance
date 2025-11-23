import axios from 'axios'

const api = axios.create({
  baseURL: '/.netlify/functions',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bmsit_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

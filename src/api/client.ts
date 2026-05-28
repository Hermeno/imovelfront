import axios from 'axios'

// const BASE_URL = 'http://localhost:3000/api'
const BASE_URL = 'https://imovelweb.onrender.com/api'

export const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('sm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sm_token')
      localStorage.removeItem('sm_company')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

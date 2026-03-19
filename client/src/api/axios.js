import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { refreshToken } = useAuthStore.getState()
        const { data } = await axios.post('/api/auth/refresh', { refreshToken })
        useAuthStore.getState().updateToken(data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
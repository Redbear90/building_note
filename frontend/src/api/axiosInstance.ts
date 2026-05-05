import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'

/**
 * 메인 axios 인스턴스 — 요청 인터셉터로 access token 자동 주입,
 * 응답 인터셉터로 401 시 한 번 토큰 갱신을 시도한다.
 *
 * 토큰 갱신은 인터셉터를 우회하기 위해 별도의 raw 인스턴스(rawAxios)로 호출한다.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

const rawAxios: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let pending: ((token: string) => void)[] = []

const flushPending = (token: string) => {
  pending.forEach((cb) => cb(token))
  pending = []
}

axiosInstance.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    if (original.url?.includes('/auth/')) {
      return Promise.reject(error)
    }

    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('토큰 갱신 타임아웃')), 5000)
        pending.push((token) => {
          clearTimeout(timeout)
          original.headers.Authorization = `Bearer ${token}`
          resolve(axiosInstance(original))
        })
      })
    }

    isRefreshing = true
    try {
      const { data } = await rawAxios.post('/auth/refresh')
      const newToken = data.data.accessToken as string
      const user = data.data.user
      useAuthStore.getState().setAuth(newToken, user)
      flushPending(newToken)
      original.headers.Authorization = `Bearer ${newToken}`
      return axiosInstance(original)
    } catch (e) {
      pending = []
      useAuthStore.getState().logout()
      // 강제 redirect는 라우터 가드가 처리. 여기서는 에러만 전파.
      return Promise.reject(e)
    } finally {
      isRefreshing = false
    }
  }
)

export default axiosInstance

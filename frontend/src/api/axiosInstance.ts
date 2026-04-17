import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'

/** Axios 인스턴스 생성 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  withCredentials: true,   // httpOnly 쿠키(리프레시 토큰) 전송
  headers: {
    'Content-Type': 'application/json',
  },
})

/** 요청 인터셉터: 액세스 토큰 자동 주입 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/** 응답 인터셉터: 401 시 토큰 갱신 후 재시도 */
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 401 에러이고, 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // /auth/refresh 자체가 401이면 로그아웃
      if (originalRequest.url?.includes('/auth/refresh')) {
        useAuthStore.getState().logout()
        window.location.href = '/'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // 다른 요청이 이미 갱신 중이면 대기 (최대 5초)
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('토큰 갱신 타임아웃'))
          }, 5000)

          subscribeTokenRefresh((token) => {
            clearTimeout(timeout)
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(axiosInstance(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // 리프레시 토큰으로 액세스 토큰 갱신
        const { data } = await axiosInstance.post('/auth/refresh')
        const newToken = data.data.accessToken

        useAuthStore.getState().setAccessToken(newToken)
        onRefreshed(newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosInstance(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance

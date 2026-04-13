import axiosInstance from './axiosInstance'
import type { ApiResponse, TokenResponse } from '@/types'

/** 인증 API */
export const authApi = {
  /** 로그인 */
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<TokenResponse>>('/auth/login', {
      email,
      password,
    })
    return data.data
  },

  /** 토큰 갱신 */
  refresh: async (): Promise<TokenResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<TokenResponse>>('/auth/refresh')
    return data.data
  },

  /** 로그아웃 */
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout')
  },
}

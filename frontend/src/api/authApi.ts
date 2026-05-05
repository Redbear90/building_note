import axiosInstance from './axiosInstance'
import type { ApiResponse, TokenResponse } from '@/types'

export const authApi = {
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<TokenResponse>>('/auth/login', { email, password })
    return data.data
  },

  signupOwner: async (payload: {
    workspaceName: string
    email: string
    password: string
    name: string
  }): Promise<TokenResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<TokenResponse>>('/auth/signup/owner', payload)
    return data.data
  },

  signupMember: async (payload: {
    inviteCode: string
    email: string
    password: string
    name: string
  }): Promise<TokenResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<TokenResponse>>('/auth/signup/member', payload)
    return data.data
  },

  refresh: async (): Promise<TokenResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<TokenResponse>>('/auth/refresh')
    return data.data
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout')
  },
}

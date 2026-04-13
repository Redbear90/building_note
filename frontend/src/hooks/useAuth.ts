import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { AxiosError } from 'axios'

/** 인증 관련 훅 */
export const useAuth = () => {
  const { user, isAdmin, isLoading, login, logout, accessToken } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        await login(email, password)
        navigate('/')
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>
        throw new Error(axiosError.response?.data?.message || '로그인에 실패했습니다.')
      }
    },
    [login, navigate]
  )

  const handleLogout = useCallback(() => {
    logout()
    navigate('/')
  }, [logout, navigate])

  return {
    user,
    isAdmin,
    isLoading,
    isAuthenticated: !!accessToken,
    login: handleLogin,
    logout: handleLogout,
  }
}

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { UserInfo } from '@/types'
import type { AxiosError } from 'axios'

export const homeForRole = (role: UserInfo['role']) => {
  switch (role) {
    case 'ADMIN':
    case 'BUILDING_OWNER':
      return '/admin'
    case 'MEMBER':
    default:
      return '/'
  }
}

const messageOf = (e: unknown, fallback: string) => {
  const ax = e as AxiosError<{ message?: string }>
  return ax?.response?.data?.message || ax?.message || fallback
}

export const useAuth = () => {
  const { user, accessToken, login, signupOwner, signupMember, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        const u = await login(email, password)
        navigate(homeForRole(u.role))
      } catch (e) {
        throw new Error(messageOf(e, '로그인에 실패했습니다.'))
      }
    },
    [login, navigate]
  )

  const handleSignupOwner = useCallback(
    async (payload: { workspaceName: string; email: string; password: string; name: string }) => {
      try {
        const u = await signupOwner(payload)
        navigate(homeForRole(u.role))
      } catch (e) {
        throw new Error(messageOf(e, '워크스페이스 생성에 실패했습니다.'))
      }
    },
    [signupOwner, navigate]
  )

  const handleSignupMember = useCallback(
    async (payload: { inviteCode: string; email: string; password: string; name: string }) => {
      try {
        const u = await signupMember(payload)
        navigate(homeForRole(u.role))
      } catch (e) {
        throw new Error(messageOf(e, '가입에 실패했습니다.'))
      }
    },
    [signupMember, navigate]
  )

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])

  return {
    user,
    role: user?.role,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isBuildingOwner: user?.role === 'BUILDING_OWNER',
    isMember: user?.role === 'MEMBER',
    accessToken,
    login: handleLogin,
    signupOwner: handleSignupOwner,
    signupMember: handleSignupMember,
    logout: handleLogout,
  }
}

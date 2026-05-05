import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api/authApi'
import type { TokenResponse, UserInfo } from '@/types'

interface AuthState {
  accessToken: string | null
  user: UserInfo | null

  setAuth: (token: string, user: UserInfo) => void
  setAccessToken: (token: string) => void
  login: (email: string, password: string) => Promise<UserInfo>
  signupOwner: (payload: { workspaceName: string; email: string; password: string; name: string }) => Promise<UserInfo>
  signupMember: (payload: { inviteCode: string; email: string; password: string; name: string }) => Promise<UserInfo>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,

      setAuth: (token, user) => set({ accessToken: token, user }),
      setAccessToken: (token) => set({ accessToken: token }),

      login: async (email, password) => {
        const res: TokenResponse = await authApi.login(email, password)
        set({ accessToken: res.accessToken, user: res.user })
        return res.user
      },

      signupOwner: async (payload) => {
        const res = await authApi.signupOwner(payload)
        set({ accessToken: res.accessToken, user: res.user })
        return res.user
      },

      signupMember: async (payload) => {
        const res = await authApi.signupMember(payload)
        set({ accessToken: res.accessToken, user: res.user })
        return res.user
      },

      logout: () => {
        authApi.logout().catch(() => undefined)
        set({ accessToken: null, user: null })
      },
    }),
    {
      name: 'building-note-auth',
      storage: {
        getItem: (name) => {
          const item = sessionStorage.getItem(name)
          return item ? JSON.parse(item) : null
        },
        setItem: (name, value) => sessionStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => sessionStorage.removeItem(name),
      },
      // accessToken은 메모리만 유지, user 정보는 sessionStorage에 보관 (새로고침 시 refresh로 복구)
      partialize: (state) => ({ user: state.user }) as unknown as AuthState,
    }
  )
)

/** 역할 헬퍼 */
export const useIsAdmin = () => useAuthStore((s) => s.user?.role === 'ADMIN')
export const useIsBuildingOwner = () => useAuthStore((s) => s.user?.role === 'BUILDING_OWNER')
export const useIsMember = () => useAuthStore((s) => s.user?.role === 'MEMBER')
export const useIsAuthenticated = () => useAuthStore((s) => !!s.user)

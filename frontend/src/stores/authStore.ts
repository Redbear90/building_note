import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api/authApi'
import type { UserInfo } from '@/types'

/** 인증 스토어 상태 타입 */
interface AuthState {
  /** 액세스 토큰 (메모리에만 보관 - XSS 방어) */
  accessToken: string | null
  /** 로그인된 사용자 정보 */
  user: UserInfo | null
  /** 관리자 여부 */
  isAdmin: boolean
  /** 로그인 처리 중 여부 */
  isLoading: boolean

  /** 액세스 토큰 설정 (토큰 갱신 시 사용) */
  setAccessToken: (token: string) => void
  /** 로그인 */
  login: (email: string, password: string) => Promise<void>
  /** 로그아웃 */
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  // 사용자 정보는 persist (sessionStorage), 토큰은 메모리에만 유지
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAdmin: false,
      isLoading: false,

      setAccessToken: (token: string) => set({ accessToken: token }),

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authApi.login(email, password)
          set({
            accessToken: response.accessToken,
            user: response.user,
            isAdmin: response.user.role === 'ADMIN',
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        // 서버에 로그아웃 요청 (리프레시 토큰 쿠키 삭제)
        authApi.logout().catch(() => {/* 실패해도 클라이언트는 초기화 */})
        set({
          accessToken: null,
          user: null,
          isAdmin: false,
        })
      },
    }),
    {
      name: 'building-note-auth',
      storage: {
        // sessionStorage 사용 (탭 닫으면 자동 삭제)
        getItem: (name) => {
          const item = sessionStorage.getItem(name)
          return item ? JSON.parse(item) : null
        },
        setItem: (name, value) => sessionStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => sessionStorage.removeItem(name),
      },
      // 토큰은 persist에서 제외 (메모리에만 유지)
      partialize: (state) => ({ user: state.user, isAdmin: state.isAdmin }),
    }
  )
)

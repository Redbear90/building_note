import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/authApi'

/**
 * 새로고침 시 accessToken이 사라진 상태에서 user만 sessionStorage에 남아있을 때,
 * 첫 진입에 /auth/refresh를 한 번 시도해 토큰을 메모리로 복구한다.
 *
 * 실패하면 user를 비워서 ProtectedRoute가 /login으로 보낸다.
 */
const AuthBootstrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, accessToken, setAuth, logout } = useAuthStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const needsRefresh = !!user && !accessToken

    if (!needsRefresh) {
      setReady(true)
      return
    }

    authApi
      .refresh()
      .then((res) => {
        if (cancelled) return
        setAuth(res.accessToken, res.user)
      })
      .catch(() => {
        if (cancelled) return
        logout()
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
    }
    // user/accessToken은 첫 마운트 시점만 보면 됨. 의존성 의도적으로 비움.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ready) return null
  return <>{children}</>
}

export default AuthBootstrap

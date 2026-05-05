import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { homeForRole } from '@/hooks/useAuth'
import type { Role } from '@/types'

interface Props {
  children: React.ReactNode
  /** 허용 역할. 미지정 시 인증만 통과하면 됨. */
  allow?: Role[]
}

/**
 * 라우트 가드.
 *  - 비로그인 → /login (이동 후 원위치 복귀를 위한 from state 첨부)
 *  - 역할 미달 → 본인의 홈으로 리다이렉트
 */
const ProtectedRoute: React.FC<Props> = ({ children, allow }) => {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (allow && !allow.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />
  }
  return <>{children}</>
}

export default ProtectedRoute

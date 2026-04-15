import React, { lazy, Suspense } from 'react'
import { Map, Building2, Settings, LogOut, LayoutDashboard } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import KakaoMap from '@/components/map/KakaoMap'
import { BuildingBottomSheet } from '@/components/building/BuildingBottomSheet'
import { BuildingSidePanel } from '@/components/building/BuildingSidePanel'
import { useAuthStore } from '@/stores/authStore'
import { useAdminStore } from '@/stores/adminStore'
import { cn } from '@/lib/utils'

const AdminPanel = lazy(() => import('@/components/admin/AdminPanel'))

/**
 * 메인 지도 페이지
 * 모바일: 지도 + 바텀시트 + 하단 탭바
 * 데스크톱: 사이드 패널 + 지도
 */
const MapPage: React.FC = () => {
  const { isAdmin, user, logout } = useAuthStore()
  const { isPanelOpen, togglePanel } = useAdminStore()
  const location = useLocation()

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      {/* 헤더 */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 h-11 bg-white border-b z-20">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary-500" />
          <span className="text-base font-bold text-gray-900">BuildingNote</span>
        </div>
        <div className="flex items-center gap-1">
          {isAdmin && (
            <>
              {/* 데스크톱: 관리자 페이지 링크 */}
              <Link
                to="/admin"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                관리자 페이지
              </Link>
              {/* 지도 위 패널 토글 */}
              <button
                onClick={togglePanel}
                className={cn(
                  'p-2 rounded-full transition-colors',
                  isPanelOpen ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-600'
                )}
                aria-label="관리자 패널"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                aria-label="로그아웃"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{user?.name ?? '로그아웃'}</span>
              </button>
            </>
          )}
          {!isAdmin && (
            <Link
              to="/admin/login"
              className="text-xs text-gray-500 hover:text-primary-600 transition-colors px-2 py-1"
            >
              관리자
            </Link>
          )}
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 데스크톱: 사이드 패널 */}
        <div className="hidden lg:block">
          <BuildingSidePanel />
        </div>

        {/* 지도 */}
        <div className="flex-1 relative">
          <KakaoMap className="absolute inset-0" />
        </div>

        {/* 관리자 패널 */}
        {isAdmin && (
          <Suspense fallback={null}>
            <AdminPanel />
          </Suspense>
        )}
      </div>

      {/* 모바일: 바텀시트 */}
      <div className="lg:hidden">
        <BuildingBottomSheet />
      </div>

      {/* 모바일: 하단 탭바 */}
      <nav className="lg:hidden flex-shrink-0 flex items-center border-t bg-white safe-bottom">
        {[
          { to: '/', icon: Map, label: '지도' },
          { to: '/buildings', icon: Building2, label: '목록' },
          ...(isAdmin ? [{ to: '/admin', icon: Settings, label: '관리' }] : []),
        ].map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
              location.pathname === to
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default MapPage

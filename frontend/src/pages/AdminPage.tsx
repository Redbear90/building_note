import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useAuth } from '@/hooks/useAuth'
import { Building2, LogOut, Map, FileText } from 'lucide-react'
import { useBuildings } from '@/queries/useBuildingQueries'
import { useZones } from '@/queries/useZoneQueries'

/**
 * 관리자 메인 페이지 (데스크톱 전용)
 * 모바일에서는 지도 페이지의 AdminPanel 사용
 */
const AdminPage: React.FC = () => {
  const { isAdmin, user } = useAuthStore()
  const { logout } = useAuth()
  const { data: buildings = [] } = useBuildings()
  const { data: zones = [] } = useZones()

  // 비관리자는 리다이렉트
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary-500" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">BuildingNote 관리자</h1>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </header>

      {/* 대시보드 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: '등록된 구역', value: zones.length, icon: Map, color: 'bg-blue-50 text-blue-600' },
            { label: '등록된 건물', value: buildings.length, icon: Building2, color: 'bg-green-50 text-green-600' },
            { label: '총 호실',
              value: '-',
              icon: FileText,
              color: 'bg-purple-50 text-purple-600'
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-lg border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 빠른 이동 */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">빠른 관리</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a
              href="/"
              className="flex items-center gap-3 p-4 rounded-md border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Map className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm font-medium text-gray-800">지도에서 관리</p>
                <p className="text-xs text-gray-500">지도 화면에서 구역/건물을 직접 관리</p>
              </div>
            </a>
            <a
              href="/buildings"
              className="flex items-center gap-3 p-4 rounded-md border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Building2 className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm font-medium text-gray-800">건물 목록</p>
                <p className="text-xs text-gray-500">등록된 건물 전체 목록 보기</p>
              </div>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminPage

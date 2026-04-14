import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useAuth } from '@/hooks/useAuth'
import { Building2, LogOut, Map, FileText, Download, RefreshCw } from 'lucide-react'
import { useBuildings } from '@/queries/useBuildingQueries'
import { useZones } from '@/queries/useZoneQueries'
import axiosInstance from '@/api/axiosInstance'

/**
 * 관리자 메인 페이지 (데스크톱 전용)
 * 모바일에서는 지도 페이지의 AdminPanel 사용
 */
const AdminPage: React.FC = () => {
  const { isAdmin, user } = useAuthStore()
  const { logout } = useAuth()
  const { data: buildings = [] } = useBuildings()
  const { data: zones = [] } = useZones()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)

  const handleExcelDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await axiosInstance.get('/export/buildings/excel', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const today = new Date().toISOString().slice(0, 10)
      link.setAttribute('download', `building_status_${today}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('엑셀 다운로드에 실패했습니다.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleMigrateBasementNames = async () => {
    if (!confirm('호실 이름에서 -101호 → B101호 형식으로 일괄 변환합니다. 계속하시겠습니까?')) return
    setIsMigrating(true)
    try {
      const response = await axiosInstance.post('/admin/migrate/unit-names/basement')
      alert(response.data?.message ?? '변환 완료')
    } catch {
      alert('마이그레이션에 실패했습니다.')
    } finally {
      setIsMigrating(false)
    }
  }

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
        <div className="bg-white rounded-lg border p-6 mb-4">
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

        {/* 데이터 내보내기 */}
        <div className="bg-white rounded-lg border p-6 mb-4">
          <h2 className="text-base font-semibold text-gray-800 mb-1">데이터 내보내기</h2>
          <p className="text-xs text-gray-500 mb-4">구역 → 건물 → 호실 순으로 ON 여부, 폼 입력값을 엑셀로 다운로드합니다.</p>
          <button
            onClick={handleExcelDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? '생성 중...' : '엑셀 다운로드 (.xlsx)'}
          </button>
        </div>

        {/* 데이터 마이그레이션 */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">데이터 마이그레이션</h2>
          <p className="text-xs text-gray-500 mb-4">기존 데이터의 형식을 일괄 변환합니다. 한 번만 실행하면 됩니다.</p>
          <button
            onClick={handleMigrateBasementNames}
            disabled={isMigrating}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isMigrating ? 'animate-spin' : ''}`} />
            {isMigrating ? '변환 중...' : '호실 이름 변환 (-101호 → B101호)'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default AdminPage

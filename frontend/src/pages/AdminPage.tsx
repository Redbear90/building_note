import React, { lazy, Suspense, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useAuth } from '@/hooks/useAuth'
import {
  Building2, LogOut, Map, FileText, Download, RefreshCw, Home, LayoutDashboard,
} from 'lucide-react'
import { useBuildings } from '@/queries/useBuildingQueries'
import { useZones } from '@/queries/useZoneQueries'
import axiosInstance from '@/api/axiosInstance'
import { Skeleton } from '@/components/common/Skeleton'
import { cn } from '@/lib/utils'
import type { Building } from '@/types'

const ZoneEditor = lazy(() => import('@/components/admin/ZoneEditor'))
const BuildingManager = lazy(() => import('@/components/admin/BuildingManager'))
const FormBuilder = lazy(() => import('@/components/admin/FormBuilder'))

type Tab = 'dashboard' | 'zones' | 'buildings' | 'formBuilder' | 'export'

const AdminPage: React.FC = () => {
  const { isAdmin, user } = useAuthStore()
  const { logout } = useAuth()
  const { data: buildings = [] } = useBuildings()
  const { data: zones = [] } = useZones()

  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)
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

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'zones', label: '구역 관리', icon: Map },
    { id: 'buildings', label: '건물 관리', icon: Building2 },
    { id: 'formBuilder', label: '폼 빌더', icon: FileText },
    { id: 'export', label: '데이터 내보내기', icon: Download },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b px-6 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-primary-500" />
            <span className="text-base font-bold text-gray-900">BuildingNote 관리자</span>
            <span className="text-xs text-gray-400">{user?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
            >
              <Home className="w-4 h-4" />
              지도로 이동
            </a>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* 사이드바 탭 */}
        <aside className="w-48 flex-shrink-0 border-r bg-white py-4">
          <nav className="space-y-0.5 px-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id)
                  if (id !== 'formBuilder') setEditingBuilding(null)
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left',
                  activeTab === id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
          }>

            {/* 대시보드 */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900">대시보드</h2>

                {/* 요약 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: '등록된 구역', value: zones.length, icon: Map, color: 'bg-blue-50 text-blue-600' },
                    { label: '등록된 건물', value: buildings.length, icon: Building2, color: 'bg-green-50 text-green-600' },
                    { label: '총 호실', value: '-', icon: FileText, color: 'bg-purple-50 text-purple-600' },
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
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">빠른 이동</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TABS.filter(t => t.id !== 'dashboard').map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                      >
                        <Icon className="w-5 h-5 text-primary-500" />
                        <span className="text-xs font-medium text-gray-700">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 구역 관리 */}
            {activeTab === 'zones' && (
              <div className="max-w-xl space-y-4">
                <h2 className="text-lg font-bold text-gray-900">구역 관리</h2>
                <div className="bg-white rounded-lg border p-5">
                  <p className="text-xs text-gray-400 mb-4">구역 그리기는 지도 화면에서만 가능합니다. 여기서는 구역 목록 확인 및 삭제만 가능합니다.</p>
                  <ZoneEditor
                    onStartDrawing={() => {}}
                    onStopDrawing={() => []}
                  />
                </div>
              </div>
            )}

            {/* 건물 관리 */}
            {activeTab === 'buildings' && !editingBuilding && (
              <div className="max-w-2xl space-y-4">
                <h2 className="text-lg font-bold text-gray-900">건물 관리</h2>
                <div className="bg-white rounded-lg border p-5">
                  <p className="text-xs text-gray-400 mb-4">지도에서 위치를 선택하려면 지도 화면의 관리자 패널을 이용하세요. 여기서는 주소 검색으로 건물을 추가할 수 있습니다.</p>
                  <BuildingManager
                    onEditFormSchema={(building) => {
                      setEditingBuilding(building)
                      setActiveTab('formBuilder')
                    }}
                  />
                </div>
              </div>
            )}

            {/* 폼 빌더 */}
            {activeTab === 'formBuilder' && (
              <div className="max-w-2xl space-y-4">
                <h2 className="text-lg font-bold text-gray-900">폼 빌더</h2>
                {editingBuilding ? (
                  <div className="bg-white rounded-lg border p-5">
                    <FormBuilder
                      buildingId={editingBuilding.id}
                      buildingName={editingBuilding.name}
                      onClose={() => {
                        setEditingBuilding(null)
                        setActiveTab('buildings')
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border p-10 text-center">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-4">편집할 건물을 먼저 선택하세요</p>
                    <button
                      onClick={() => setActiveTab('buildings')}
                      className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      건물 관리로 이동
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 데이터 내보내기 */}
            {activeTab === 'export' && (
              <div className="max-w-xl space-y-4">
                <h2 className="text-lg font-bold text-gray-900">데이터 내보내기</h2>

                <div className="bg-white rounded-lg border p-6 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800">엑셀 다운로드</h3>
                  <p className="text-xs text-gray-500">구역 → 건물 → 호실 순으로 ON 여부, 폼 입력값을 엑셀로 다운로드합니다.</p>
                  <button
                    onClick={handleExcelDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {isDownloading ? '생성 중...' : '엑셀 다운로드 (.xlsx)'}
                  </button>
                </div>

                <div className="bg-white rounded-lg border p-6 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800">데이터 마이그레이션</h3>
                  <p className="text-xs text-gray-500">기존 데이터의 형식을 일괄 변환합니다. 한 번만 실행하면 됩니다.</p>
                  <button
                    onClick={handleMigrateBasementNames}
                    disabled={isMigrating}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-60 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isMigrating ? 'animate-spin' : ''}`} />
                    {isMigrating ? '변환 중...' : '호실 이름 변환 (-101호 → B101호)'}
                  </button>
                </div>
              </div>
            )}

          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default AdminPage

import React, { lazy, Suspense, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useAuth } from '@/hooks/useAuth'
import {
  Building2, LogOut, Map, FileText, Download, Home, LayoutDashboard, Users, KeyRound, Copy, RefreshCw,
} from 'lucide-react'
import { useBuildings } from '@/queries/useBuildingQueries'
import { useZones } from '@/queries/useZoneQueries'
import { useTotalUnitCount, useUnitStats } from '@/queries/useUnitQueries'
import {
  useMembers,
  useMyOrganization,
  useRotateInviteCode,
  useRemoveMember,
} from '@/queries/useOrganizationQueries'
import axiosInstance from '@/api/axiosInstance'
import { Skeleton } from '@/components/common/Skeleton'
import { cn } from '@/lib/utils'
import type { Building } from '@/types'

const ZoneEditor = lazy(() => import('@/components/admin/ZoneEditor'))
const BuildingManager = lazy(() => import('@/components/admin/BuildingManager'))
const FormBuilder = lazy(() => import('@/components/admin/FormBuilder'))

type Tab = 'dashboard' | 'zones' | 'buildings' | 'formBuilder' | 'members' | 'export'

const AdminPage: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const { logout } = useAuth()
  const { data: buildings = [] } = useBuildings()
  const { data: zones = [] } = useZones()
  const { data: totalUnitCount = '-' } = useTotalUnitCount()
  const { data: unitStats } = useUnitStats()

  const isOwner = user?.role === 'BUILDING_OWNER'

  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleExcelDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await axiosInstance.get('/export/buildings/excel', { responseType: 'blob' })
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

  const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }>; ownerOnly?: boolean }[] = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'zones', label: '구역 관리', icon: Map, ownerOnly: true },
    { id: 'buildings', label: '건물 관리', icon: Building2, ownerOnly: true },
    { id: 'formBuilder', label: '폼 빌더', icon: FileText, ownerOnly: true },
    { id: 'members', label: '멤버 관리', icon: Users, ownerOnly: true },
    { id: 'export', label: '데이터 내보내기', icon: Download, ownerOnly: true },
  ]
  const visibleTabs = TABS.filter((t) => !t.ownerOnly || isOwner)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-primary-500" />
            <span className="text-base font-bold text-gray-900">
              BuildingNote {user?.role === 'ADMIN' ? '운영자' : '관리자'}
            </span>
            <span className="text-xs text-gray-400">
              {user?.organizationName ? `${user.organizationName} · ` : ''}{user?.email}
            </span>
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
        <aside className="w-48 flex-shrink-0 border-r bg-white py-4">
          <nav className="space-y-0.5 px-2">
            {visibleTabs.map(({ id, label, icon: Icon }) => (
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

        <main className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
          }>

            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900">대시보드</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: '등록된 구역', value: zones.length, icon: Map, color: 'bg-blue-50 text-blue-600' },
                    { label: '등록된 건물', value: buildings.length, icon: Building2, color: 'bg-green-50 text-green-600' },
                    { label: '전체 호실', value: totalUnitCount, icon: FileText, color: 'bg-purple-50 text-purple-600' },
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {(() => {
                    const total = unitStats?.total ?? 0
                    const active = unitStats?.active ?? 0
                    const inactive = unitStats?.inactive ?? 0
                    const rate = total > 0 ? ((active / total) * 100).toFixed(2) : '0.00'
                    return [
                      { label: '동의 호실', value: active, sub: '슬라이드 ON', color: 'border-l-4 border-l-green-500', textColor: 'text-green-600' },
                      { label: '미참여 호실', value: inactive, sub: '슬라이드 OFF', color: 'border-l-4 border-l-gray-300', textColor: 'text-gray-500' },
                      { label: '전체 호실', value: total, sub: '워크스페이스 합계', color: 'border-l-4 border-l-purple-400', textColor: 'text-purple-600' },
                      { label: '참여율', value: `${rate}%`, sub: '동의/전체', color: 'border-l-4 border-l-primary-500', textColor: 'text-primary-600' },
                    ]
                  })().map(({ label, value, sub, color, textColor }) => (
                    <div key={label} className={`bg-white rounded-lg border p-5 ${color}`}>
                      <p className="text-sm text-gray-500">{label}</p>
                      <p className={`text-2xl font-bold mt-1 ${textColor}`}>{unitStats ? value : '-'}</p>
                      <p className="text-xs text-gray-400 mt-1">{sub}</p>
                    </div>
                  ))}
                </div>

                {isOwner && <InviteCodeCard />}
              </div>
            )}

            {activeTab === 'zones' && isOwner && (
              <div className="max-w-xl space-y-4">
                <h2 className="text-lg font-bold text-gray-900">구역 관리</h2>
                <div className="bg-white rounded-lg border p-5">
                  <p className="text-xs text-gray-400 mb-4">
                    구역 그리기는 지도 화면에서만 가능합니다. 여기서는 구역 목록 확인 및 삭제만 가능합니다.
                  </p>
                  <ZoneEditor onStartDrawing={() => {}} onStopDrawing={() => []} />
                </div>
              </div>
            )}

            {activeTab === 'buildings' && isOwner && !editingBuilding && (
              <div className="max-w-2xl space-y-4">
                <h2 className="text-lg font-bold text-gray-900">건물 관리</h2>
                <div className="bg-white rounded-lg border p-5">
                  <BuildingManager
                    onEditFormSchema={(building) => {
                      setEditingBuilding(building)
                      setActiveTab('formBuilder')
                    }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'formBuilder' && isOwner && (
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

            {activeTab === 'members' && isOwner && <MembersPanel />}

            {activeTab === 'export' && isOwner && (
              <div className="max-w-xl space-y-4">
                <h2 className="text-lg font-bold text-gray-900">데이터 내보내기</h2>
                <div className="bg-white rounded-lg border p-6 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800">엑셀 다운로드</h3>
                  <p className="text-xs text-gray-500">
                    구역 → 건물 → 호실 순으로 슬라이드 ON 여부, 폼 입력값을 엑셀로 다운로드합니다.
                  </p>
                  <button
                    onClick={handleExcelDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {isDownloading ? '생성 중...' : '엑셀 다운로드 (.xlsx)'}
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

const InviteCodeCard: React.FC = () => {
  const { data: org } = useMyOrganization()
  const rotate = useRotateInviteCode()
  if (!org) return null

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(org.inviteCode)
      alert('초대 코드가 복사되었습니다.')
    } catch {
      // ignore
    }
  }

  return (
    <div className="bg-white rounded-lg border p-5">
      <div className="flex items-center gap-2 mb-3">
        <KeyRound className="w-4 h-4 text-primary-500" />
        <h3 className="text-sm font-semibold text-gray-800">멤버 초대 코드</h3>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        멤버가 회원가입 시 입력하는 코드입니다. 유출되었다면 재발급하세요.
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 text-sm font-mono tracking-widest bg-gray-50 border rounded">
          {org.inviteCode}
        </code>
        <button
          onClick={copyCode}
          className="p-2 border rounded text-gray-500 hover:bg-gray-50"
          aria-label="복사"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (confirm('초대 코드를 재발급하시겠습니까? 기존 코드는 즉시 무효화됩니다.')) {
              rotate.mutate()
            }
          }}
          disabled={rotate.isPending}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${rotate.isPending ? 'animate-spin' : ''}`} />
          재발급
        </button>
      </div>
    </div>
  )
}

const MembersPanel: React.FC = () => {
  const { data: members = [], isLoading } = useMembers()
  const remove = useRemoveMember()

  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-lg font-bold text-gray-900">멤버 관리</h2>
      <InviteCodeCard />
      <div className="bg-white rounded-lg border">
        <div className="px-5 py-3 border-b">
          <h3 className="text-sm font-semibold text-gray-800">멤버 목록 ({members.length})</h3>
        </div>
        {isLoading ? (
          <div className="p-5"><Skeleton className="h-10 w-full" /></div>
        ) : (
          <ul className="divide-y">
            {members.map((m) => (
              <li key={m.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{m.name ?? m.email}</p>
                  <p className="text-xs text-gray-500">{m.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full',
                    m.role === 'BUILDING_OWNER' ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-600'
                  )}>
                    {m.role === 'BUILDING_OWNER' ? '소유자' : '멤버'}
                  </span>
                  {m.role === 'MEMBER' && (
                    <button
                      onClick={() => {
                        if (confirm(`'${m.email}' 멤버를 제거하시겠습니까?`)) remove.mutate(m.id)
                      }}
                      disabled={remove.isPending}
                      className="text-xs text-red-500 hover:underline"
                    >
                      제거
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default AdminPage

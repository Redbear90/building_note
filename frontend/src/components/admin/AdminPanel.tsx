import React, { lazy, Suspense, useRef, useState, useCallback, useEffect } from 'react'
import { X, Map, Building2, FileText, GripVertical } from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { useMapStore } from '@/stores/mapStore'
import type { Building } from '@/types'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/common/Skeleton'

const ZoneEditor = lazy(() => import('./ZoneEditor'))
const BuildingManager = lazy(() => import('./BuildingManager'))
const FormBuilder = lazy(() => import('./FormBuilder'))

const MIN_WIDTH = 280
const MAX_WIDTH = 720
const DEFAULT_WIDTH = 384  // max-w-sm = 24rem = 384px

/**
 * 관리자 패널 (우측 드로어)
 * 탭: 구역관리 / 건물관리 / 폼빌더
 * 좌측 엣지를 드래그하여 너비 조정 가능
 */
const AdminPanel: React.FC = () => {
  const { isPanelOpen, setPanel, activeTab, setActiveTab } = useAdminStore()
  const [editingBuilding, setEditingBuilding] = React.useState<Building | null>(null)
  const { startDrawingZone, stopDrawingZone, isPickingLocation } = useMapStore()

  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(DEFAULT_WIDTH)

  const TABS = [
    { id: 'zones' as const, label: '구역', icon: Map },
    { id: 'buildings' as const, label: '건물', icon: Building2 },
    { id: 'formBuilder' as const, label: editingBuilding ? editingBuilding.name : '폼', icon: FileText },
  ]

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true
    startXRef.current = e.clientX
    startWidthRef.current = width
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }, [width])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const delta = startXRef.current - e.clientX
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta))
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  if (!isPanelOpen) return null

  return (
    <>
      {/* 배경 오버레이 (모바일) */}
      {!isPickingLocation && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setPanel(false)}
        />
      )}

      {/* 패널 */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full z-50 bg-white shadow-2xl flex flex-col',
          isPickingLocation && 'pointer-events-none opacity-50'
        )}
        style={{ width: `${width}px` }}
      >
        {/* 리사이즈 핸들 (좌측 엣지) */}
        <div
          onMouseDown={handleResizeStart}
          className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize z-10 group flex items-center justify-center hover:bg-primary-200 transition-colors"
          title="드래그하여 너비 조정"
        >
          <GripVertical className="w-3 h-3 text-gray-300 group-hover:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 pl-5">
          <h2 className="text-sm font-semibold text-gray-800">관리자 패널</h2>
          <button
            onClick={() => setPanel(false)}
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); if (id !== 'formBuilder') setEditingBuilding(null) }}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors px-1',
                activeTab === id
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate w-full text-center">{label}</span>
            </button>
          ))}
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          <Suspense fallback={<div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>}>
            {activeTab === 'zones' && (
              <ZoneEditor
                onStartDrawing={startDrawingZone ?? (() => {})}
                onStopDrawing={stopDrawingZone ?? (() => [])}
              />
            )}
            {activeTab === 'buildings' && !editingBuilding && (
              <BuildingManager onEditFormSchema={(building) => {
                setEditingBuilding(building)
                setActiveTab('formBuilder')
              }} />
            )}
            {activeTab === 'formBuilder' && editingBuilding && (
              <FormBuilder
                buildingId={editingBuilding.id}
                buildingName={editingBuilding.name}
                onClose={() => { setEditingBuilding(null); setActiveTab('buildings') }}
              />
            )}
            {activeTab === 'formBuilder' && !editingBuilding && (
              <div className="text-center py-12 text-sm text-gray-400">
                건물 탭에서 편집할 건물을 선택하세요
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default AdminPanel

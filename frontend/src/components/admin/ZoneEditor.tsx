import React, { useState } from 'react'
import { Pencil, Trash2, Check, X, RotateCcw } from 'lucide-react'
import { ZonePolygon } from '@/components/map/ZonePolygon'
import { useZones, useCreateZone, useUpdateZone, useDeleteZone } from '@/queries/useZoneQueries'
import { useAdminStore } from '@/stores/adminStore'
import { cn } from '@/lib/utils'
import type { Zone } from '@/types'

interface ZoneEditorProps {
  onStartDrawing: () => void
  onStopDrawing: () => [number, number][]
}

/**
 * 구역 관리 컴포넌트
 * - 구역 목록 표시
 * - 새 구역 그리기 (지도 클릭 이벤트)
 * - 구역 수정 (이름/색상/폴리곤)
 * - 구역 삭제
 */
const ZoneEditor: React.FC<ZoneEditorProps> = ({ onStartDrawing, onStopDrawing }) => {
  const { data: zones = [] } = useZones()
  const createZone = useCreateZone()
  const updateZone = useUpdateZone()
  const deleteZone = useDeleteZone()
  const { isDrawingZone, toggleDrawingZone } = useAdminStore()

  // 새 구역 생성 상태
  const [newZoneName, setNewZoneName] = useState('')
  const [newZoneColor, setNewZoneColor] = useState('#01696f')
  const [showNameInput, setShowNameInput] = useState(false)
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([])

  // 구역 수정 상태
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [editPoints, setEditPoints] = useState<[number, number][]>([])
  const [isRedrawing, setIsRedrawing] = useState(false)

  /** 구역 그리기 시작 (새 구역) */
  const handleStartDrawing = () => {
    toggleDrawingZone()
    onStartDrawing()
    setShowNameInput(false)
  }

  /** 구역 그리기 완료 (새 구역) */
  const handleFinishDrawing = () => {
    const points = onStopDrawing()
    setDrawnPoints(points)
    toggleDrawingZone()

    if (points.length >= 3) {
      setShowNameInput(true)
    } else {
      alert('구역을 그리려면 최소 3개 이상의 지점을 클릭하세요.')
    }
  }

  /** 구역 저장 (새 구역) */
  const handleSaveZone = async () => {
    if (!newZoneName.trim()) {
      alert('구역 이름을 입력하세요.')
      return
    }
    await createZone.mutateAsync({
      name: newZoneName,
      polygon: drawnPoints,
      color: newZoneColor,
    })
    setNewZoneName('')
    setShowNameInput(false)
    setDrawnPoints([])
  }

  /** 수정 모드 진입 */
  const handleStartEdit = (zone: Zone) => {
    setEditingZone(zone)
    setEditName(zone.name)
    setEditColor(zone.color)
    setEditPoints(zone.polygon)
    setIsRedrawing(false)
  }

  /** 수정 취소 */
  const handleCancelEdit = () => {
    if (isRedrawing) {
      onStopDrawing()
      toggleDrawingZone()
      setIsRedrawing(false)
    }
    setEditingZone(null)
  }

  /** 폴리곤 재그리기 시작 */
  const handleStartRedraw = () => {
    setIsRedrawing(true)
    onStartDrawing()
    toggleDrawingZone()
  }

  /** 폴리곤 재그리기 완료 */
  const handleFinishRedraw = () => {
    const points = onStopDrawing()
    toggleDrawingZone()
    setIsRedrawing(false)

    if (points.length >= 3) {
      setEditPoints(points)
    } else {
      alert('구역을 그리려면 최소 3개 이상의 지점을 클릭하세요.')
    }
  }

  /** 구역 수정 저장 */
  const handleSaveEdit = async () => {
    if (!editingZone) return
    if (!editName.trim()) {
      alert('구역 이름을 입력하세요.')
      return
    }
    await updateZone.mutateAsync({
      id: editingZone.id,
      name: editName,
      polygon: editPoints,
      color: editColor,
    })
    setEditingZone(null)
  }

  return (
    <div className="space-y-4">
      {/* 구역 그리기 컨트롤 */}
      <div className="space-y-2">
        {!isDrawingZone && !showNameInput && !editingZone && (
          <button
            onClick={handleStartDrawing}
            className="flex items-center gap-2 w-full px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            새 구역 그리기
          </button>
        )}

        {isDrawingZone && !isRedrawing && (
          <div className="space-y-2">
            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-xs text-amber-700 font-medium">구역 그리기 모드</p>
              <p className="text-xs text-amber-600 mt-0.5">지도를 클릭하여 꼭짓점을 추가하세요</p>
            </div>
            <button
              onClick={handleFinishDrawing}
              className="flex items-center gap-2 w-full px-4 py-2.5 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition-colors"
            >
              <Check className="w-4 h-4" />
              그리기 완료
            </button>
            <button
              onClick={() => {
                onStopDrawing()
                toggleDrawingZone()
              }}
              className="flex items-center gap-2 w-full px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              취소
            </button>
          </div>
        )}

        {/* 새 구역 이름/색상 입력 */}
        {showNameInput && (
          <div className="space-y-2 p-4 bg-gray-50 rounded-md border">
            <p className="text-xs font-medium text-gray-700">구역 정보 입력</p>
            <input
              type="text"
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              placeholder="구역 이름"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">색상:</label>
              <input
                type="color"
                value={newZoneColor}
                onChange={(e) => setNewZoneColor(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveZone}
                disabled={createZone.isPending}
                className="flex-1 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-60"
              >
                저장
              </button>
              <button
                onClick={() => { setShowNameInput(false); setDrawnPoints([]) }}
                className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 구역 목록 */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">등록된 구역 ({zones.length})</p>
        {zones.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">구역이 없습니다</p>
        ) : (
          <div className="space-y-1">
            {zones.map((zone) => (
              <div key={zone.id} className="space-y-0">
                {/* 구역 행 */}
                <div className="flex items-center gap-2 group">
                  <div className="flex-1">
                    <ZonePolygon zone={zone} />
                  </div>
                  {!editingZone && (
                    <>
                      <button
                        onClick={() => handleStartEdit(zone)}
                        className={cn(
                          'p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded',
                          'opacity-0 group-hover:opacity-100 transition-opacity'
                        )}
                        title="구역 수정"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`"${zone.name}" 구역을 삭제하시겠습니까?`)) {
                            deleteZone.mutate(zone.id)
                          }
                        }}
                        className={cn(
                          'p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded',
                          'opacity-0 group-hover:opacity-100 transition-opacity'
                        )}
                        title="구역 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>

                {/* 수정 폼 (해당 구역에만 인라인 표시) */}
                {editingZone?.id === zone.id && (
                  <div className="mt-1 mb-2 p-4 bg-gray-50 rounded-md border space-y-2">
                    <p className="text-xs font-medium text-gray-700">구역 수정</p>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="구역 이름"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">색상:</label>
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>

                    {/* 폴리곤 재그리기 */}
                    {isRedrawing ? (
                      <div className="space-y-2">
                        <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-md">
                          <p className="text-xs text-amber-700 font-medium">폴리곤 재그리기 모드</p>
                          <p className="text-xs text-amber-600 mt-0.5">지도를 클릭하여 꼭짓점을 추가하세요</p>
                        </div>
                        <button
                          onClick={handleFinishRedraw}
                          className="flex items-center gap-2 w-full px-3 py-2 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          재그리기 완료
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleStartRedraw}
                        className="flex items-center gap-2 w-full px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        폴리곤 재그리기
                        {editPoints.length !== zone.polygon.length && (
                          <span className="ml-auto text-green-600 font-medium">변경됨</span>
                        )}
                      </button>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={updateZone.isPending || isRedrawing}
                        className="flex-1 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-60"
                      >
                        저장
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ZoneEditor

import React, { useState } from 'react'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import { ZonePolygon } from '@/components/map/ZonePolygon'
import { useZones, useCreateZone, useDeleteZone } from '@/queries/useZoneQueries'
import { useAdminStore } from '@/stores/adminStore'
import { cn } from '@/lib/utils'

interface ZoneEditorProps {
  onStartDrawing: () => void
  onStopDrawing: () => [number, number][]
}

/**
 * 구역 관리 컴포넌트
 * - 구역 목록 표시
 * - 새 구역 그리기 (지도 클릭 이벤트)
 * - 구역 삭제
 */
const ZoneEditor: React.FC<ZoneEditorProps> = ({ onStartDrawing, onStopDrawing }) => {
  const { data: zones = [] } = useZones()
  const createZone = useCreateZone()
  const deleteZone = useDeleteZone()
  const { isDrawingZone, toggleDrawingZone } = useAdminStore()

  const [newZoneName, setNewZoneName] = useState('')
  const [newZoneColor, setNewZoneColor] = useState('#01696f')
  const [showNameInput, setShowNameInput] = useState(false)
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([])

  /** 구역 그리기 시작 */
  const handleStartDrawing = () => {
    toggleDrawingZone()
    onStartDrawing()
    setShowNameInput(false)
  }

  /** 구역 그리기 완료 */
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

  /** 구역 저장 */
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

  return (
    <div className="space-y-4">
      {/* 구역 그리기 컨트롤 */}
      <div className="space-y-2">
        {!isDrawingZone && !showNameInput && (
          <button
            onClick={handleStartDrawing}
            className="flex items-center gap-2 w-full px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            새 구역 그리기
          </button>
        )}

        {isDrawingZone && (
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

        {/* 구역 이름/색상 입력 */}
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
              <div key={zone.id} className="flex items-center gap-2 group">
                <div className="flex-1">
                  <ZonePolygon zone={zone} />
                </div>
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
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ZoneEditor

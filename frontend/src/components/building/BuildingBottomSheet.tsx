import React from 'react'
import { MapPin, X } from 'lucide-react'
import { BottomSheet } from '@/components/common/BottomSheet'
import { UnitGrid } from './UnitGrid'
import { useMapStore } from '@/stores/mapStore'
import type { SnapPoint } from '@/types'

/**
 * 모바일 바텀시트 - 선택된 건물의 호실 목록 표시
 */
export const BuildingBottomSheet: React.FC = () => {
  const { selectedBuilding, snapPoint, setSnapPoint, selectBuilding } = useMapStore()

  const handleSnapChange = (point: SnapPoint) => {
    setSnapPoint(point)
    if (point === 'hidden') selectBuilding(null)
  }

  return (
    <BottomSheet snapPoint={snapPoint} onSnapChange={handleSnapChange}>
      {selectedBuilding ? (
        <div>
          {/* 건물 헤더 */}
          <div className="flex items-start justify-between px-4 pb-3 border-b">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-gray-900 leading-tight">
                {selectedBuilding.name}
              </h2>
              {selectedBuilding.address && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <p className="text-xs text-gray-500 truncate">{selectedBuilding.address}</p>
                </div>
              )}
              {selectedBuilding.zoneName && (
                <span className="inline-block mt-1.5 px-2 py-0.5 text-xs bg-primary-50 text-primary-600 rounded-full">
                  {selectedBuilding.zoneName}
                </span>
              )}
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => handleSnapChange('hidden')}
              className="ml-3 p-1.5 rounded-full hover:bg-gray-100 flex-shrink-0"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* 호실 그리드 */}
          <UnitGrid building={selectedBuilding} />
        </div>
      ) : (
        <div className="px-4 py-6 text-center text-sm text-gray-400">
          지도에서 건물을 선택하세요
        </div>
      )}
    </BottomSheet>
  )
}

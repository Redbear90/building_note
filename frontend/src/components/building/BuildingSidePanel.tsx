import React from 'react'
import { MapPin, Building2 } from 'lucide-react'
import { UnitGrid } from './UnitGrid'
import { useMapStore } from '@/stores/mapStore'
import { useBuildings } from '@/queries/useBuildingQueries'
import { BuildingListSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'

/**
 * 데스크톱 사이드 패널
 * 좌측 320px 패널에 건물 목록 → 호실 목록 → 폼 표시
 */
export const BuildingSidePanel: React.FC = () => {
  const { selectedBuilding, selectBuilding } = useMapStore()
  const { data: buildings = [], isLoading } = useBuildings()

  return (
    <div className="w-80 h-full bg-white border-r flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700">
          {selectedBuilding ? selectedBuilding.name : '건물 목록'}
        </h2>
        {selectedBuilding && (
          <button
            onClick={() => selectBuilding(null)}
            className="text-xs text-primary-600 hover:underline mt-0.5"
          >
            ← 목록으로
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 건물 선택 전: 건물 목록 */}
        {!selectedBuilding && (
          <>
            {isLoading ? (
              <BuildingListSkeleton />
            ) : buildings.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="등록된 건물이 없습니다"
              />
            ) : (
              <ul className="divide-y">
                {buildings.map((building) => (
                  <li key={building.id}>
                    <button
                      onClick={() => selectBuilding(building)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">{building.name}</p>
                      {building.address && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500 truncate">{building.address}</p>
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* 건물 선택 후: 호실 그리드 */}
        {selectedBuilding && (
          <>
            {selectedBuilding.address && (
              <div className="px-4 py-2 border-b">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-500">{selectedBuilding.address}</p>
                </div>
              </div>
            )}
            <UnitGrid building={selectedBuilding} />
          </>
        )}
      </div>
    </div>
  )
}

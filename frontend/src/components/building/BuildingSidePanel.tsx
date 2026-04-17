import React, { useState, useEffect, useCallback } from 'react'
import { MapPin, Building2, Search } from 'lucide-react'
import { UnitGrid } from './UnitGrid'
import { BuildingEditModal } from './BuildingEditModal'
import { BuildingStatusIcon } from './BuildingStatusIcon'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: buildings = [], isLoading } = useBuildings(
    undefined,
    debouncedSearch || undefined
  )

  // 수정 완료 후 선택된 건물 데이터 갱신
  const handleEditClose = useCallback(() => {
    if (selectedBuilding) {
      const updatedBuilding = buildings.find((b) => b.id === selectedBuilding.id)
      if (updatedBuilding) {
        selectBuilding(updatedBuilding)
      }
    }
    setShowEditModal(false)
  }, [selectedBuilding, buildings, selectBuilding])

  return (
    <div className="w-80 h-full bg-white border-r flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            {selectedBuilding ? selectedBuilding.name : '건물 목록'}
          </h2>
          {selectedBuilding && (
            <button
              onClick={() => setShowEditModal(true)}
              className="text-xs text-primary-600 hover:underline"
            >
              수정
            </button>
          )}
        </div>
        {selectedBuilding && (
          <button
            onClick={() => { selectBuilding(null); setSearchQuery('') }}
            className="text-xs text-primary-600 hover:underline mt-0.5"
          >
            ← 목록으로
          </button>
        )}
        {/* 건물 목록 상태일 때만 검색창 표시 */}
        {!selectedBuilding && (
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="건물명 또는 주소 검색"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
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
                      className="w-full px-4 py-3 flex items-center gap-2.5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <BuildingStatusIcon buildingId={building.id} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{building.name}</p>
                        {building.address && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-500 truncate">{building.address}</p>
                          </div>
                        )}
                      </div>
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

      {showEditModal && selectedBuilding && (
        <BuildingEditModal
          building={selectedBuilding}
          onClose={handleEditClose}
        />
      )}
    </div>
  )
}

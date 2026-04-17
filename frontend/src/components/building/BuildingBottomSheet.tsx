import React, { useState, useEffect, useCallback } from 'react'
import { MapPin, X, Search, ChevronRight } from 'lucide-react'
import { BottomSheet } from '@/components/common/BottomSheet'
import { UnitGrid } from './UnitGrid'
import { BuildingEditModal } from './BuildingEditModal'
import { BuildingStatusIcon } from './BuildingStatusIcon'
import { useMapStore } from '@/stores/mapStore'
import { useBuildings } from '@/queries/useBuildingQueries'
import type { Building, SnapPoint } from '@/types'

/**
 * 모바일 바텀시트 - 건물 목록(검색) → 호실 목록
 */
export const BuildingBottomSheet: React.FC = () => {
  const { selectedBuilding, snapPoint, setSnapPoint, selectBuilding } = useMapStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: buildings = [] } = useBuildings(undefined, debouncedSearch || undefined)

  const handleSnapChange = (point: SnapPoint) => {
    setSnapPoint(point)
    if (point === 'hidden') {
      selectBuilding(null)
      setSearchQuery('')
    }
  }

  const handleSelectBuilding = (building: Building) => {
    selectBuilding(building)
    setSearchQuery('')
  }

  // 수정 완료 후 선택된 건물 데이터 갱신
  const handleEditClose = useCallback(() => {
    if (selectedBuilding) {
      const updatedBuilding = buildings.find((b) => b.id === selectedBuilding.id)
      if (updatedBuilding) {
        selectBuilding(updatedBuilding)
      }
    }
    setEditingBuilding(null)
  }, [selectedBuilding, buildings, selectBuilding])

  return (
    <>
      <BottomSheet snapPoint={snapPoint} onSnapChange={handleSnapChange}>
        {selectedBuilding ? (
          <div>
            {/* 건물 헤더 */}
            <div className="flex items-start justify-between px-4 pb-3 border-b">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-gray-900 leading-tight">
                    {selectedBuilding.name}
                  </h2>
                  <button
                    onClick={() => setEditingBuilding(selectedBuilding)}
                    className="text-xs text-primary-600 hover:underline flex-shrink-0"
                  >
                    수정
                  </button>
                </div>
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
              <button
                onClick={() => handleSnapChange('hidden')}
                className="ml-3 p-1.5 rounded-full hover:bg-gray-100 flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <UnitGrid building={selectedBuilding} />
          </div>
        ) : (
          <div>
            {/* 검색창 */}
            <div className="px-4 pb-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="건물명 또는 주소 검색"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-gray-100 rounded-md outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            {/* 건물 목록 */}
            {buildings.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                {searchQuery ? '검색 결과가 없습니다.' : '지도에서 건물을 선택하세요'}
              </div>
            ) : (
              <ul className="divide-y">
                {buildings.map((building) => (
                  <li key={building.id}>
                    <button
                      onClick={() => handleSelectBuilding(building)}
                      className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <BuildingStatusIcon buildingId={building.id} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{building.name}</p>
                        {building.address && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <p className="text-xs text-gray-500 truncate">{building.address}</p>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </BottomSheet>

      {editingBuilding && (
        <BuildingEditModal
          building={editingBuilding}
          onClose={handleEditClose}
        />
      )}
    </>
  )
}

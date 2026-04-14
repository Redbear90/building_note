import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronRight, Search, Building2 } from 'lucide-react'
import { useBuildings } from '@/queries/useBuildingQueries'
import { useZones } from '@/queries/useZoneQueries'
import { useMapStore } from '@/stores/mapStore'
import { BuildingListSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'

/**
 * 건물 목록 페이지
 * 전체 건물 목록을 구역 필터 + 검색으로 탐색
 */
const BuildingListPage: React.FC = () => {
  const navigate = useNavigate()
  const { selectBuilding } = useMapStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedZoneId, setSelectedZoneId] = useState<string>('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: buildings = [], isLoading } = useBuildings(
    selectedZoneId || undefined,
    debouncedSearch || undefined
  )
  const { data: zones = [] } = useZones()

  const handleBuildingClick = (buildingId: string) => {
    const building = buildings.find((b) => b.id === buildingId)
    if (building) {
      selectBuilding(building)
      navigate('/')  // 지도 페이지로 이동
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b px-4 py-3">
        <h1 className="text-base font-bold text-gray-900 mb-3">건물 목록</h1>

        {/* 검색 */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="건물명 또는 주소 검색"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 rounded-md outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* 구역 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedZoneId('')}
            className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              !selectedZoneId
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setSelectedZoneId(zone.id === selectedZoneId ? '' : zone.id)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                selectedZoneId === zone.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {zone.name}
            </button>
          ))}
        </div>
      </header>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <BuildingListSkeleton />
        ) : buildings.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="건물이 없습니다"
            description={searchQuery ? '검색 결과가 없습니다.' : '등록된 건물이 없습니다.'}
          />
        ) : (
          <ul className="divide-y bg-white">
            {buildings.map((building) => (
              <li key={building.id}>
                <button
                  onClick={() => handleBuildingClick(building.id)}
                  className="w-full px-4 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors active:bg-gray-100"
                >
                  {/* 아이콘 */}
                  <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-primary-500" />
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{building.name}</p>
                    {building.address && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <p className="text-xs text-gray-500 truncate">{building.address}</p>
                      </div>
                    )}
                    {building.zoneName && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary-50 text-primary-600 rounded-full">
                        {building.zoneName}
                      </span>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default BuildingListPage

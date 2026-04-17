import React, { useState, useEffect, lazy, Suspense } from 'react'
import { Plus, Pencil, Trash2, Building2, ChevronRight, GripVertical, MapPin, X, Search, Loader2, Import, Wand2, SkipForward } from 'lucide-react'
import { useBuildings, useCreateBuilding, useDeleteBuilding } from '@/queries/useBuildingQueries'
import { useUnits, useCreateUnit, useDeleteUnit } from '@/queries/useUnitQueries'
import { useZones } from '@/queries/useZoneQueries'
import { useMapStore } from '@/stores/mapStore'
import { BulkUnitCreateModal } from '@/components/building/BulkUnitCreateModal'
import type { Building, KakaoAddressSearchResult } from '@/types'
import { cn } from '@/lib/utils'

const BuildingImportModal = lazy(() => import('./BuildingImportModal'))

interface BuildingManagerProps {
  onEditFormSchema: (building: Building) => void
}

const BuildingManager: React.FC<BuildingManagerProps> = ({ onEditFormSchema }) => {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  const [showAddBuilding, setShowAddBuilding] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showAddUnit, setShowAddUnit] = useState(false)
  // 건물 추가 후 호실 생성 단계 (null=없음, Building=대상건물)
  const [pendingUnitBuilding, setPendingUnitBuilding] = useState<Building | null>(null)
  const [showBulkModal, setShowBulkModal] = useState(false)

  const [buildingForm, setBuildingForm] = useState({
    name: '', address: '', lat: '', lng: '', zoneId: ''
  })
  const [addressResults, setAddressResults] = useState<KakaoAddressSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const { isPickingLocation, startPickingLocation, moveToCenter, showTempMarker } = useMapStore()
  const [unitForm, setUnitForm] = useState({ name: '', floor: '' })

  const { data: buildings = [] } = useBuildings()
  const { data: units = [] } = useUnits(selectedBuilding?.id ?? pendingUnitBuilding?.id ?? null)
  const { data: zones = [] } = useZones()
  const createBuilding = useCreateBuilding()
  const deleteBuilding = useDeleteBuilding()
  const createUnit = useCreateUnit()
  const deleteUnit = useDeleteUnit()

  // 폼 닫힐 때 검색 결과 초기화
  useEffect(() => {
    if (!showAddBuilding) setAddressResults([])
  }, [showAddBuilding])

  /** 주소 검색 */
  const handleAddressSearch = () => {
    const query = buildingForm.address.trim()
    if (!query) return
    if (!window.kakao?.maps?.services) return

    setIsSearching(true)
    setAddressResults([])

    const geocoder = new window.kakao.maps.services.Geocoder()
    geocoder.addressSearch(query, (results, status) => {
      setIsSearching(false)
      if (status === window.kakao.maps.services.Status.OK) {
        setAddressResults(results)
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        setAddressResults([])
      } else {
        console.error('주소 검색 실패:', status)
        setAddressResults([])
      }
    })
  }

  /** 검색 결과 선택 → 좌표 입력 + 지도 이동 + 임시 마커 */
  const handleSelectAddress = (result: KakaoAddressSearchResult) => {
    const lat = parseFloat(result.y)
    const lng = parseFloat(result.x)

    setBuildingForm((p) => ({
      ...p,
      address: result.address_name,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    }))
    setAddressResults([])
    moveToCenter?.(lat, lng, 1)
    showTempMarker?.(lat, lng)
  }

  /** 지도에서 위치 선택 */
  const handlePickLocation = () => {
    startPickingLocation((lat, lng, address) => {
      setBuildingForm((p) => ({
        ...p,
        lat: lat.toFixed(6),
        lng: lng.toFixed(6),
        address: address || p.address,
      }))
    })
  }

  /** 건물 추가 → 호실 생성 단계로 이동 */
  const handleAddBuilding = async () => {
    if (!buildingForm.name) {
      alert('건물명을 입력하세요.')
      return
    }
    if (!buildingForm.lat || !buildingForm.lng) {
      alert('주소 검색 또는 지도에서 위치를 선택하세요.')
      return
    }
    const newBuilding = await createBuilding.mutateAsync({
      name: buildingForm.name,
      address: buildingForm.address || undefined,
      lat: parseFloat(buildingForm.lat),
      lng: parseFloat(buildingForm.lng),
      zoneId: buildingForm.zoneId || undefined,
    })
    setBuildingForm({ name: '', address: '', lat: '', lng: '', zoneId: '' })
    setAddressResults([])
    setShowAddBuilding(false)
    // 호실 생성 단계로 진입
    setPendingUnitBuilding(newBuilding)
  }

  /** 단독주택 기본값으로 1층 1호실 자동 생성 후 완료 */
  const handleSkipWithDefault = async () => {
    if (!pendingUnitBuilding) return
    await createUnit.mutateAsync({
      buildingId: pendingUnitBuilding.id,
      name: '101호',
      floor: 1,
      sortOrder: 0,
    })
    setPendingUnitBuilding(null)
  }

  /** 호실 생성 단계 완료 */
  const handleFinishUnitSetup = () => {
    setPendingUnitBuilding(null)
  }

  /** 호실 추가 */
  const handleAddUnit = async () => {
    if (!selectedBuilding || !unitForm.name) return
    const floorNum = unitForm.floor ? parseInt(unitForm.floor) : undefined
    if (floorNum === 0) {
      alert('0층은 입력할 수 없습니다.')
      return
    }
    await createUnit.mutateAsync({
      buildingId: selectedBuilding.id,
      name: unitForm.name,
      floor: floorNum,
      sortOrder: units.length,
    })
    setUnitForm({ name: '', floor: '' })
    setShowAddUnit(false)
  }

  return (
    <div className="space-y-4">
      {showImportModal && (
        <Suspense fallback={null}>
          <BuildingImportModal onClose={() => setShowImportModal(false)} />
        </Suspense>
      )}

      {/* 일괄 생성 모달 (건물 추가 직후 & 기존 관리 모두 공용) */}
      {showBulkModal && (pendingUnitBuilding || selectedBuilding) && (
        <BulkUnitCreateModal
          buildingId={(pendingUnitBuilding ?? selectedBuilding)!.id}
          currentUnitCount={units.length}
          onClose={() => setShowBulkModal(false)}
        />
      )}

      {/* ── 단계 2: 건물 추가 직후 호실 생성 ── */}
      {pendingUnitBuilding ? (
        <>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-500 text-white text-xs font-bold">2</span>
            <p className="text-sm font-semibold text-gray-800">호실 생성</p>
            <span className="text-xs text-gray-400">— {pendingUnitBuilding.name}</span>
          </div>
          <p className="text-xs text-gray-500">호실을 직접 추가하거나 일괄 생성하세요. 단독주택이라면 넘기기를 누르면 1층 1호실이 자동 생성됩니다.</p>

          {/* 액션 버튼 */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 w-full px-4 py-3 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              호실 일괄 생성
            </button>
            <button
              onClick={() => setShowAddUnit((v) => !v)}
              className="flex items-center gap-2 w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:border-primary-400 hover:text-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              개별 호실 추가
            </button>
          </div>

          {/* 개별 추가 인라인 폼 */}
          {showAddUnit && (
            <div className="p-3 bg-gray-50 rounded-md border space-y-2">
              <input
                type="text"
                placeholder="호실명 (예: 101호) *"
                value={unitForm.name}
                onChange={(e) => setUnitForm((p) => ({ ...p, name: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddUnit()}
                autoFocus
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="number"
                placeholder="층수"
                value={unitForm.floor}
                onChange={(e) => setUnitForm((p) => ({ ...p, floor: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const floorNum = unitForm.floor ? parseInt(unitForm.floor) : undefined
                    if (floorNum === 0) { alert('0층은 입력할 수 없습니다.'); return }
                    if (!unitForm.name.trim()) return
                    await createUnit.mutateAsync({
                      buildingId: pendingUnitBuilding.id,
                      name: unitForm.name,
                      floor: floorNum,
                      sortOrder: units.length,
                    })
                    setUnitForm({ name: '', floor: '' })
                  }}
                  disabled={createUnit.isPending}
                  className="flex-1 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 disabled:opacity-60"
                >
                  추가
                </button>
                <button
                  onClick={() => { setShowAddUnit(false); setUnitForm({ name: '', floor: '' }) }}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg"
                >
                  닫기
                </button>
              </div>
            </div>
          )}

          {/* 추가된 호실 목록 */}
          {units.length > 0 && (
            <div className="space-y-1">
              {units.map((unit) => (
                <div key={unit.id} className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white">
                  <Building2 className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                  <span className="text-sm text-gray-800">{unit.name}</span>
                  {unit.floor != null && (
                    <span className="text-xs text-gray-400">{unit.floor < 0 ? `지하${Math.abs(unit.floor)}층` : `${unit.floor}층`}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 하단 완료/넘기기 */}
          <div className="flex gap-2 pt-2 border-t">
            {units.length > 0 ? (
              <button
                onClick={handleFinishUnitSetup}
                className="flex-1 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
              >
                완료 ({units.length}개 호실)
              </button>
            ) : (
              <button
                onClick={handleSkipWithDefault}
                disabled={createUnit.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-60 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                넘기기 (단독주택 1층 1호실 자동 생성)
              </button>
            )}
          </div>
        </>
      ) : !selectedBuilding ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">건물 ({buildings.length})</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600"
              >
                <Import className="w-3.5 h-3.5" />
                지도에서 가져오기
              </button>
              <button
                onClick={() => setShowAddBuilding(!showAddBuilding)}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-3.5 h-3.5" />
                건물 추가
              </button>
            </div>
          </div>

          {/* 건물 추가 폼 */}
          {showAddBuilding && (
            <div className="p-3 bg-gray-50 rounded-md border space-y-2">
              {/* 건물명 */}
              <input
                type="text"
                placeholder="건물명 *"
                value={buildingForm.name}
                onChange={(e) => setBuildingForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />

              {/* 주소 검색 */}
              <div className="space-y-1">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="주소 입력 후 검색"
                    value={buildingForm.address}
                    onChange={(e) => {
                      setBuildingForm((p) => ({ ...p, address: e.target.value }))
                      if (addressResults.length) setAddressResults([])
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddressSearch}
                    disabled={isSearching || !buildingForm.address.trim()}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 transition-colors"
                  >
                    {isSearching
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Search className="w-4 h-4" />
                    }
                  </button>
                </div>

                {/* 검색 결과 드롭다운 */}
                {addressResults.length > 0 && (
                  <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
                    {addressResults.map((result, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectAddress(result)}
                        className="w-full px-3 py-2.5 text-left hover:bg-primary-50 transition-colors border-b last:border-b-0 border-gray-100"
                      >
                        <p className="text-xs font-medium text-gray-800 truncate">
                          {result.address_name}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 지도에서 위치 선택 */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={handlePickLocation}
                  disabled={isPickingLocation}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg border transition-colors',
                    isPickingLocation
                      ? 'bg-amber-50 border-amber-300 text-amber-700 cursor-wait'
                      : buildingForm.lat
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600'
                  )}
                >
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {isPickingLocation
                    ? '지도를 클릭하여 위치를 선택하세요...'
                    : buildingForm.lat
                    ? `위치 선택됨 (${buildingForm.lat}, ${buildingForm.lng})`
                    : '지도에서 직접 위치 선택'}
                </button>
                {buildingForm.lat && (
                  <button
                    type="button"
                    onClick={() => setBuildingForm((p) => ({ ...p, lat: '', lng: '' }))}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                    위치 초기화
                  </button>
                )}
              </div>

              {/* 구역 선택 */}
              <select
                value={buildingForm.zoneId}
                onChange={(e) => setBuildingForm((p) => ({ ...p, zoneId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
              >
                <option value="">구역 없음</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={handleAddBuilding}
                  disabled={createBuilding.isPending}
                  className="flex-1 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 disabled:opacity-60"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setShowAddBuilding(false)
                    setBuildingForm({ name: '', address: '', lat: '', lng: '', zoneId: '' })
                    setAddressResults([])
                  }}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 건물 목록 */}
          <div className="space-y-1">
            {buildings.map((building) => (
              <div
                key={building.id}
                className="flex items-center gap-2 p-3 rounded-md border border-gray-200 bg-white hover:border-primary-300 transition-colors group"
              >
                <Building2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{building.name}</p>
                  {building.address && (
                    <p className="text-xs text-gray-500 truncate">{building.address}</p>
                  )}
                </div>
                <div className={cn('flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity')}>
                  <button
                    onClick={() => onEditFormSchema(building)}
                    className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                    title="폼 스키마 편집"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedBuilding(building)}
                    className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                    title="호실 관리"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`"${building.name}" 건물을 삭제하시겠습니까?`)) {
                        deleteBuilding.mutate(building.id)
                      }
                    }}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* 호실 목록 */
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedBuilding(null)}
              className="text-xs text-primary-600 hover:underline"
            >
              ← 건물 목록
            </button>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs font-medium text-gray-700">{selectedBuilding.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">호실 ({units.length})</p>
            <button
              onClick={() => setShowAddUnit(!showAddUnit)}
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
            >
              <Plus className="w-3.5 h-3.5" />
              호실 추가
            </button>
          </div>

          {showAddUnit && (
            <div className="p-3 bg-gray-50 rounded-md border space-y-2">
              <input
                type="text"
                placeholder="호실명 (예: 101호) *"
                value={unitForm.name}
                onChange={(e) => setUnitForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="number"
                placeholder="층수"
                value={unitForm.floor}
                onChange={(e) => setUnitForm((p) => ({ ...p, floor: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddUnit}
                  disabled={createUnit.isPending}
                  className="flex-1 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 disabled:opacity-60"
                >
                  저장
                </button>
                <button
                  onClick={() => setShowAddUnit(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {units.map((unit) => (
              <div
                key={unit.id}
                className="flex items-center gap-2 p-3 rounded-md border border-gray-200 bg-white group"
              >
                <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{unit.name}</p>
                  {unit.floor != null && (
                    <p className="text-xs text-gray-500">{unit.floor}층</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (confirm(`"${unit.name}" 호실을 삭제하시겠습니까?`)) {
                      deleteUnit.mutate({ unitId: unit.id, buildingId: selectedBuilding.id })
                    }
                  }}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default BuildingManager


import React, { useState } from 'react'
import { Modal } from '@/components/common/Modal'
import { useUpdateBuilding } from '@/queries/useBuildingQueries'
import { useZones } from '@/queries/useZoneQueries'
import { useMapStore } from '@/stores/mapStore'
import { MapPin, Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Building, KakaoAddressSearchResult } from '@/types'

interface BuildingEditModalProps {
  building: Building
  onClose: () => void
}

/**
 * 건물 정보 수정 모달
 * BuildingSidePanel(데스크톱) / BuildingBottomSheet(모바일) 양쪽에서 사용
 */
export const BuildingEditModal: React.FC<BuildingEditModalProps> = ({ building, onClose }) => {
  const { data: zones = [] } = useZones()
  const updateBuilding = useUpdateBuilding()
  const { moveToCenter, showTempMarker, startPickingLocation, isPickingLocation } = useMapStore()

  const [form, setForm] = useState({
    name: building.name,
    address: building.address ?? '',
    lat: String(building.lat),
    lng: String(building.lng),
    zoneId: building.zoneId ?? '',
  })
  const [addressResults, setAddressResults] = useState<KakaoAddressSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleAddressSearch = () => {
    const query = form.address.trim()
    if (!query || !window.kakao?.maps?.services) return
    setIsSearching(true)
    setAddressResults([])
    const geocoder = new window.kakao.maps.services.Geocoder()
    geocoder.addressSearch(query, (results, status) => {
      setIsSearching(false)
      if (status === window.kakao.maps.services.Status.OK) {
        setAddressResults(results)
      } else {
        setAddressResults([])
        alert('주소 검색 결과가 없습니다.')
      }
    })
  }

  const handleSelectAddress = (result: KakaoAddressSearchResult) => {
    const lat = parseFloat(result.y)
    const lng = parseFloat(result.x)
    setForm((p) => ({ ...p, address: result.address_name, lat: lat.toFixed(6), lng: lng.toFixed(6) }))
    setAddressResults([])
    moveToCenter?.(lat, lng, 1)
    showTempMarker?.(lat, lng)
  }

  const handlePickLocation = () => {
    startPickingLocation((lat, lng, address) => {
      setForm((p) => ({
        ...p,
        lat: lat.toFixed(6),
        lng: lng.toFixed(6),
        address: address || p.address,
      }))
    })
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) { alert('건물명을 입력하세요.'); return }
    if (!form.lat || !form.lng) { alert('위치를 선택하세요.'); return }
    await updateBuilding.mutateAsync({
      id: building.id,
      name: form.name,
      address: form.address || undefined,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      zoneId: form.zoneId || undefined,
    })
    onClose()
  }

  return (
    <Modal isOpen onClose={onClose} title="건물 정보 수정" size="md">
      <div className="px-5 py-4 space-y-3">
        {/* 건물명 */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">건물명 *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* 주소 검색 */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">주소</label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={form.address}
              onChange={(e) => { setForm((p) => ({ ...p, address: e.target.value })); setAddressResults([]) }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
              placeholder="주소 입력 후 검색"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              disabled={isSearching || !form.address.trim()}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
          {addressResults.length > 0 && (
            <div className="mt-1 border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
              {addressResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectAddress(r)}
                  className="w-full px-3 py-2.5 text-left hover:bg-primary-50 border-b last:border-b-0 border-gray-100"
                >
                  <p className="text-xs font-medium text-gray-800 truncate">{r.address_name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 지도에서 위치 선택 */}
        <button
          type="button"
          onClick={handlePickLocation}
          disabled={isPickingLocation}
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg border transition-colors',
            isPickingLocation
              ? 'bg-amber-50 border-amber-300 text-amber-700 cursor-wait'
              : form.lat
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-white border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600'
          )}
        >
          <MapPin className="w-4 h-4 flex-shrink-0" />
          {isPickingLocation
            ? '지도를 클릭하여 위치를 선택하세요...'
            : form.lat
            ? `위치: (${parseFloat(form.lat).toFixed(4)}, ${parseFloat(form.lng).toFixed(4)})`
            : '지도에서 직접 위치 선택'}
        </button>

        {/* 구역 선택 */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">구역</label>
          <select
            value={form.zoneId}
            onChange={(e) => setForm((p) => ({ ...p, zoneId: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
          >
            <option value="">구역 없음</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSubmit}
            disabled={updateBuilding.isPending}
            className="flex-1 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-60"
          >
            {updateBuilding.isPending ? '저장 중...' : '저장'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
          >
            취소
          </button>
        </div>
      </div>
    </Modal>
  )
}

import React, { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Search, Loader2, MapPin, Check, Download } from 'lucide-react'
import { useMapStore } from '@/stores/mapStore'
import { useCreateBuilding } from '@/queries/useBuildingQueries'
import { useZones } from '@/queries/useZoneQueries'
import type { KakaoPlaceResult } from '@/types'
import { cn } from '@/lib/utils'

interface BuildingImportModalProps {
  onClose: () => void
}

/** 카카오 로컬 API - 현재 지도 범위 내 장소 검색 후 건물 일괄 등록 */
const BuildingImportModal: React.FC<BuildingImportModalProps> = ({ onClose }) => {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<KakaoPlaceResult[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isSearching, setIsSearching] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const [zoneId, setZoneId] = useState('')
  const [searchDone, setSearchDone] = useState(false)

  const { getBounds } = useMapStore()
  const createBuilding = useCreateBuilding()
  const { data: zones = [] } = useZones()

  /** 지도 범위 내 키워드 검색 (최대 45개 — 페이지 3장 × 15개) */
  const handleSearch = useCallback(() => {
    if (!window.kakao?.maps?.services) return
    const bounds = getBounds?.()
    if (!bounds) {
      alert('지도가 준비되지 않았습니다.')
      return
    }

    setIsSearching(true)
    setResults([])
    setSelected(new Set())
    setSearchDone(false)

    const rect = `${bounds.swLng},${bounds.swLat},${bounds.neLng},${bounds.neLat}`
    const ps = new window.kakao.maps.services.Places()

    const allResults: KakaoPlaceResult[] = []

    const searchPage = (page: number) => {
      const searchFn = keyword.trim()
        ? ps.keywordSearch.bind(ps)
        : null

      if (keyword.trim()) {
        ps.keywordSearch(
          keyword.trim(),
          (data, status, pagination) => {
            if (status === window.kakao.maps.services.Status.OK) {
              allResults.push(...data)
              if (pagination.hasNextPage && page < 3) {
                pagination.nextPage()
              } else {
                setResults(allResults)
                setIsSearching(false)
                setSearchDone(true)
              }
            } else {
              setResults(allResults)
              setIsSearching(false)
              setSearchDone(true)
            }
          },
          { rect, size: 15 }
        )
      } else {
        // 키워드 없으면 건물/부동산(SW1) 카테고리 검색
        ps.categorySearch(
          'SW1',
          (data, status, pagination) => {
            if (status === window.kakao.maps.services.Status.OK) {
              allResults.push(...data)
              if (pagination.hasNextPage && page < 3) {
                pagination.nextPage()
              } else {
                setResults(allResults)
                setIsSearching(false)
                setSearchDone(true)
              }
            } else {
              setResults(allResults)
              setIsSearching(false)
              setSearchDone(true)
            }
          },
          { rect }
        )
      }
    }

    searchPage(1)
  }, [getBounds, keyword])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === results.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(results.map((r) => r.id)))
    }
  }

  /** 선택한 건물 일괄 등록 */
  const handleImport = async () => {
    const targets = results.filter((r) => selected.has(r.id))
    if (!targets.length) return

    setIsImporting(true)
    setImportedCount(0)
    let count = 0

    for (const place of targets) {
      try {
        await createBuilding.mutateAsync({
          name: place.place_name,
          address: place.road_address_name || place.address_name || undefined,
          lat: parseFloat(place.y),
          lng: parseFloat(place.x),
          zoneId: zoneId || undefined,
        })
        count++
        setImportedCount(count)
      } catch {
        // 개별 실패는 건너뜀
      }
    }

    setIsImporting(false)
    alert(`${count}개 건물이 등록되었습니다.`)
    onClose()
  }

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col max-h-[85vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">지도에서 건물 가져오기</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* 검색 옵션 */}
          <div className="px-5 py-4 space-y-3 border-b">
            <p className="text-xs text-gray-500">현재 지도 화면 범위 안의 건물을 검색합니다.</p>

            {/* 키워드 */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="키워드 (빈칸이면 건물 전체 검색)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {isSearching
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Search className="w-4 h-4" />
                }
                <span className="text-sm">검색</span>
              </button>
            </div>

            {/* 구역 선택 */}
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
            >
              <option value="">구역 없음</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          {/* 결과 목록 */}
          {searchDone && (
            <div>
              {/* 전체선택 바 */}
              <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50 border-b">
                <button
                  onClick={toggleAll}
                  className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-primary-600"
                >
                  <div className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0',
                    selected.size === results.length && results.length > 0
                      ? 'bg-primary-500 border-primary-500'
                      : 'border-gray-300'
                  )}>
                    {selected.size === results.length && results.length > 0 && (
                      <Check className="w-2.5 h-2.5 text-white" />
                    )}
                  </div>
                  전체 선택 ({results.length}개)
                </button>
                <span className="text-xs text-gray-400">{selected.size}개 선택됨</span>
              </div>

              {results.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">검색 결과가 없습니다.<br />지도를 원하는 위치로 이동 후 다시 검색하세요.</p>
              ) : (
                <ul className="divide-y">
                  {results.map((place) => (
                    <li key={place.id}>
                      <button
                        onClick={() => toggleSelect(place.id)}
                        className={cn(
                          'w-full flex items-start gap-3 px-5 py-3 text-left transition-colors',
                          selected.has(place.id) ? 'bg-primary-50' : 'hover:bg-gray-50'
                        )}
                      >
                        <div className={cn(
                          'mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0',
                          selected.has(place.id) ? 'bg-primary-500 border-primary-500' : 'border-gray-300'
                        )}>
                          {selected.has(place.id) && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{place.place_name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <p className="text-xs text-gray-500 truncate">
                              {place.road_address_name || place.address_name}
                            </p>
                          </div>
                          {place.category_name && (
                            <p className="text-[11px] text-gray-400 mt-0.5 truncate">{place.category_name}</p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* 하단 등록 버튼 */}
        {searchDone && results.length > 0 && (
          <div className="px-5 py-4 border-t bg-gray-50 flex-shrink-0 flex items-center gap-3">
            {isImporting && (
              <p className="text-xs text-gray-500 flex-1">{importedCount}/{selected.size} 등록 중...</p>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleImport}
              disabled={selected.size === 0 || isImporting}
              className="flex-1 py-2.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isImporting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Download className="w-4 h-4" />
              }
              {selected.size}개 등록
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

export default BuildingImportModal

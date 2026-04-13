import React, { useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'
import { useKakaoMap } from '@/hooks/useKakaoMap'
import { useMapStore } from '@/stores/mapStore'
import { useBuildings } from '@/queries/useBuildingQueries'
import { useZones } from '@/queries/useZoneQueries'
import { polygonCenter } from '@/lib/utils'
import type { Building } from '@/types'

interface KakaoMapProps {
  className?: string
}

/**
 * Kakao Map 메인 컴포넌트
 * - 건물 커스텀 마커 표시
 * - 구역 폴리곤 오버레이
 * - 건물 클릭 시 바텀시트/사이드패널 오픈
 */
const KakaoMap: React.FC<KakaoMapProps> = ({ className }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const initialMoveRef = useRef(false)
  const { selectBuilding, setMapReady, registerDrawingHandlers, registerMoveToCenter, registerShowTempMarker, registerGetBounds, isPickingLocation, stopPickingLocation } = useMapStore()

  const { data: buildings = [] } = useBuildings()
  const { data: zones = [] } = useZones()

  const handleBuildingClick = (building: Building) => {
    selectBuilding(building)
  }

  const {
    isReady,
    addBuildingMarker,
    clearBuildingMarkers,
    addZonePolygon,
    clearZonePolygons,
    startDrawingZone,
    stopDrawingZone,
    moveToCenter,
    showTempMarker,
    getBounds,
  } = useKakaoMap(mapRef, { onBuildingClick: handleBuildingClick })

  // 지도 준비 완료 알림 + 핸들러 등록
  useEffect(() => {
    setMapReady(isReady)
    if (isReady) {
      registerDrawingHandlers(startDrawingZone, stopDrawingZone)
      registerMoveToCenter(moveToCenter)
      registerShowTempMarker(showTempMarker)
      registerGetBounds(getBounds as () => { swLat: number; swLng: number; neLat: number; neLng: number })
    }
  }, [isReady, setMapReady, registerDrawingHandlers, startDrawingZone, stopDrawingZone, registerMoveToCenter, moveToCenter, registerShowTempMarker, showTempMarker, registerGetBounds, getBounds])

  // 지도 준비 완료 시 첫 번째 구역 중심으로 1회 이동
  useEffect(() => {
    if (!isReady || !zones.length || initialMoveRef.current) return
    const center = polygonCenter(zones[0].polygon)
    if (center) {
      moveToCenter(center.lat, center.lng, 3)  // 50m 축척
      initialMoveRef.current = true
    }
  }, [isReady, zones, moveToCenter])

  // 구역 폴리곤 렌더링
  useEffect(() => {
    if (!isReady) return
    clearZonePolygons()
    zones.forEach(addZonePolygon)
  }, [isReady, zones, addZonePolygon, clearZonePolygons])

  // 건물 마커 렌더링
  useEffect(() => {
    if (!isReady) return
    clearBuildingMarkers()
    buildings.forEach(addBuildingMarker)
  }, [isReady, buildings, addBuildingMarker, clearBuildingMarkers])

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full" />
      {/* 지도 로딩 중 오버레이 */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500">지도 로딩 중...</p>
          </div>
        </div>
      )}

      {/* 위치 선택 모드 안내 배너 */}
      {isPickingLocation && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-full shadow-lg pointer-events-none">
          <MapPin className="w-4 h-4 animate-bounce" />
          건물 위치를 클릭하여 선택하세요
        </div>
      )}
    </div>
  )
}

export default KakaoMap

import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import type { Building, KakaoLatLng, KakaoMap, KakaoPolyline, Zone } from '@/types'
import { useMapStore } from '@/stores/mapStore'
import { polygonCenter } from '@/lib/utils'

interface UseKakaoMapOptions {
  onBuildingClick?: (building: Building) => void
  onMapClick?: (lat: number, lng: number) => void
}

interface UseKakaoMapReturn {
  map: KakaoMap | null
  isReady: boolean
  addBuildingMarker: (building: Building) => void
  clearBuildingMarkers: () => void
  addZonePolygon: (zone: Zone) => void
  clearZonePolygons: () => void
  startDrawingZone: () => void
  stopDrawingZone: () => [number, number][]
  moveToBuilding: (building: Building) => void
}

/**
 * Kakao Map 훅
 * - 지도 초기화
 * - 건물 커스텀 마커 추가/삭제
 * - 구역 폴리곤 추가/삭제
 * - 관리자 구역 그리기 모드
 */
export const useKakaoMap = (
  mapRef: RefObject<HTMLDivElement>,
  options: UseKakaoMapOptions = {}
): UseKakaoMapReturn => {
  const [map, setMap] = useState<KakaoMap | null>(null)
  const [isReady, setIsReady] = useState(false)
  const { isPickingLocation, onLocationPicked, stopPickingLocation, registerShowTempMarker } = useMapStore()

  // 마커/폴리곤 레퍼런스 (리렌더링 없이 관리)
  const markersRef = useRef<{ overlay: unknown; building: Building }[]>([])
  const polygonsRef = useRef<unknown[]>([])
  const tempMarkerRef = useRef<unknown>(null)

  // 구역 그리기 관련
  const isDrawingRef = useRef(false)
  const drawingPointsRef = useRef<[number, number][]>([])
  const drawingPolylineRef = useRef<KakaoPolyline | null>(null)
  const clickListenerRef = useRef<unknown>(null)

  /** 지도 초기화 */
  useEffect(() => {
    if (!mapRef.current) return

    const initMap = () => {
      if (!mapRef.current) return
      const kakao = window.kakao.maps
      const center = new kakao.LatLng(37.5665, 126.9780)
      const kakaoMap = new kakao.Map(mapRef.current, {
        center,
        level: 4,
      })
      setMap(kakaoMap)
      setIsReady(true)
    }

    // Kakao SDK 스크립트가 아직 로드 중이면 폴링으로 대기
    const waitForKakao = () => {
      if (window.kakao && window.kakao.maps) {
        // autoload=false 이므로 load() 콜백으로 초기화
        window.kakao.maps.load(initMap)
      } else {
        setTimeout(waitForKakao, 100)
      }
    }

    waitForKakao()
  }, [mapRef])

  /** 건물 커스텀 오버레이 마커 추가 */
  const addBuildingMarker = useCallback(
    (building: Building) => {
      if (!map || !window.kakao) return

      const kakao = window.kakao.maps
      const position = new kakao.LatLng(building.lat, building.lng)

      // 커스텀 오버레이 HTML
      const content = `
        <div class="building-marker" data-id="${building.id}">
          <div class="building-marker-icon">🏢</div>
          <div class="building-marker-label">${building.name}</div>
        </div>
      `

      const overlay = new kakao.CustomOverlay({
        position,
        content,
        map,
        yAnchor: 1,  // 콘텐츠 하단이 좌표에 정렬 (아이콘+라벨 전체가 좌표 위에 위치)
      })

      // 마커 클릭 이벤트는 오버레이 HTML의 click 이벤트로 처리
      const element = document.querySelector(`[data-id="${building.id}"]`)
      if (element) {
        element.addEventListener('click', () => {
          options.onBuildingClick?.(building)
        })
      }

      markersRef.current.push({ overlay, building })
    },
    [map, options]
  )

  /** 건물 마커 전체 삭제 */
  const clearBuildingMarkers = useCallback(() => {
    markersRef.current.forEach(({ overlay }) => {
      // @ts-expect-error: Kakao SDK 동적 메서드 호출
      overlay.setMap(null)
    })
    markersRef.current = []
    // 임시 핀 마커도 함께 제거 (건물 저장 완료 시)
    if (tempMarkerRef.current) {
      // @ts-expect-error: Kakao SDK 동적 메서드
      tempMarkerRef.current.setMap(null)
      tempMarkerRef.current = null
    }
  }, [])

  /** 구역 폴리곤 추가 (클릭 시 중심으로 이동) */
  const addZonePolygon = useCallback(
    (zone: Zone) => {
      if (!map || !window.kakao) return

      const kakao = window.kakao.maps
      const path = zone.polygon.map(([lat, lng]) => new kakao.LatLng(lat, lng))

      const polygon = new kakao.Polygon({
        path,
        strokeWeight: 2,
        strokeColor: zone.color,
        strokeOpacity: 0.8,
        fillColor: zone.color,
        fillOpacity: 0.1,
        map,
      })

      // 폴리곤 클릭 시 해당 구역 중심으로 이동
      kakao.event.addListener(polygon, 'click', () => {
        const center = polygonCenter(zone.polygon)
        if (center) {
          map.setCenter(new kakao.LatLng(center.lat, center.lng))
          map.setLevel(5)
        }
      })

      polygonsRef.current.push(polygon)
    },
    [map]
  )

  /** 구역 폴리곤 전체 삭제 */
  const clearZonePolygons = useCallback(() => {
    polygonsRef.current.forEach((polygon) => {
      // @ts-expect-error: Kakao SDK 동적 메서드 호출
      polygon.setMap(null)
    })
    polygonsRef.current = []
  }, [])

  /** 구역 그리기 시작 (관리자 모드) */
  const startDrawingZone = useCallback(() => {
    if (!map || !window.kakao) return

    isDrawingRef.current = true
    drawingPointsRef.current = []

    const kakao = window.kakao.maps

    // 지도 클릭 이벤트로 좌표 수집
    const clickListener = (mouseEvent: unknown) => {
      if (!isDrawingRef.current) return

      // @ts-expect-error: Kakao 이벤트 객체
      const latlng = mouseEvent.latLng as KakaoLatLng
      const point: [number, number] = [latlng.getLat(), latlng.getLng()]
      drawingPointsRef.current.push(point)

      // 임시 폴리라인 그리기
      if (drawingPolylineRef.current) {
        drawingPolylineRef.current.setMap(null)
      }

      const path = drawingPointsRef.current.map(
        ([lat, lng]) => new kakao.LatLng(lat, lng)
      )
      drawingPolylineRef.current = new kakao.Polyline({
        path,
        strokeColor: '#01696f',
        strokeOpacity: 0.8,
        strokeWeight: 2,
      })
      drawingPolylineRef.current.setMap(map)
    }

    clickListenerRef.current = clickListener
    kakao.event.addListener(map, 'click', clickListener)
  }, [map])

  /** 구역 그리기 종료 - 완성된 좌표 반환 */
  const stopDrawingZone = useCallback((): [number, number][] => {
    if (!map || !window.kakao) return []

    isDrawingRef.current = false
    const kakao = window.kakao.maps

    // 클릭 이벤트 제거
    if (clickListenerRef.current) {
      kakao.event.removeListener(map, 'click', clickListenerRef.current as () => void)
      clickListenerRef.current = null
    }

    // 임시 폴리라인 제거
    if (drawingPolylineRef.current) {
      drawingPolylineRef.current.setMap(null)
      drawingPolylineRef.current = null
    }

    const points = [...drawingPointsRef.current]
    drawingPointsRef.current = []
    return points
  }, [map])

  /** 지도 중심을 건물 위치로 이동 */
  const moveToBuilding = useCallback(
    (building: Building) => {
      if (!map || !window.kakao) return
      const kakao = window.kakao.maps
      const latlng = new kakao.LatLng(building.lat, building.lng)
      map.setCenter(latlng)
    },
    [map]
  )

  /** 지도 중심을 좌표로 이동 (level 선택) */
  const moveToCenter = useCallback(
    (lat: number, lng: number, level = 5) => {
      if (!map || !window.kakao) return
      const kakao = window.kakao.maps
      map.setCenter(new kakao.LatLng(lat, lng))
      map.setLevel(level)
    },
    [map]
  )

  /** 외부에서 임시 마커를 직접 표시 (주소 검색 결과 선택 시) */
  const showTempMarker = useCallback(
    (lat: number, lng: number) => {
      if (!map || !window.kakao) return
      const kakao = window.kakao.maps
      if (tempMarkerRef.current) {
        // @ts-expect-error: Kakao SDK 동적 메서드
        tempMarkerRef.current.setMap(null)
      }
      tempMarkerRef.current = new kakao.Marker({
        position: new kakao.LatLng(lat, lng),
        map,
      })
    },
    [map]
  )

  /** 위치 선택 모드: 지도 클릭 시 임시 마커 표시 + 좌표/주소 전달 */
  const locationPickListenerRef = useRef<unknown>(null)

  useEffect(() => {
    if (!map || !window.kakao) return
    const kakao = window.kakao.maps

    if (isPickingLocation) {
      if (mapRef.current) mapRef.current.style.cursor = 'crosshair'

      const listener = (mouseEvent: unknown) => {
        // @ts-expect-error: Kakao 이벤트 객체
        const latlng = mouseEvent.latLng as KakaoLatLng
        const lat = latlng.getLat()
        const lng = latlng.getLng()

        // 기존 임시 마커 제거
        if (tempMarkerRef.current) {
          // @ts-expect-error: Kakao SDK 동적 메서드
          tempMarkerRef.current.setMap(null)
          tempMarkerRef.current = null
        }

        // 선택 위치에 임시 마커 표시
        tempMarkerRef.current = new kakao.Marker({
          position: new kakao.LatLng(lat, lng),
          map,
        })

        // 역지오코딩으로 주소 조회
        try {
          const geocoder = new window.kakao.maps.services.Geocoder()
          geocoder.coord2Address(lng, lat, (result, status) => {
            const address =
              status === window.kakao.maps.services.Status.OK
                ? (result[0].road_address?.address_name ?? result[0].address.address_name)
                : ''
            onLocationPicked?.(lat, lng, address)
          })
        } catch {
          onLocationPicked?.(lat, lng, '')
        }

        stopPickingLocation()
      }

      locationPickListenerRef.current = listener
      kakao.event.addListener(map, 'click', listener)
    } else {
      if (mapRef.current) mapRef.current.style.cursor = ''
      if (locationPickListenerRef.current) {
        kakao.event.removeListener(map, 'click', locationPickListenerRef.current as () => void)
        locationPickListenerRef.current = null
      }
    }

    return () => {
      if (locationPickListenerRef.current) {
        kakao.event.removeListener(map, 'click', locationPickListenerRef.current as () => void)
        locationPickListenerRef.current = null
      }
      if (mapRef.current) mapRef.current.style.cursor = ''
    }
  }, [isPickingLocation, map, mapRef, onLocationPicked, stopPickingLocation])

  return {
    map,
    isReady,
    addBuildingMarker,
    clearBuildingMarkers,
    addZonePolygon,
    clearZonePolygons,
    startDrawingZone,
    stopDrawingZone,
    moveToBuilding,
    moveToCenter,
    showTempMarker,
  }
}

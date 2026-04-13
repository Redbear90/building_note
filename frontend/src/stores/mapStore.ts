import { create } from 'zustand'
import type { Building, SnapPoint } from '@/types'

/** 지도 스토어 상태 타입 */
interface MapState {
  /** 현재 선택된 건물 */
  selectedBuilding: Building | null
  /** 바텀시트 스냅 포인트 */
  snapPoint: SnapPoint
  /** 지도 초기화 여부 */
  isMapReady: boolean
  /** 지도 중심 좌표 */
  center: { lat: number; lng: number }
  /** 지도 줌 레벨 */
  zoomLevel: number
  /** 구역 그리기 시작 함수 (KakaoMap이 등록) */
  startDrawingZone: (() => void) | null
  /** 구역 그리기 종료 함수 (KakaoMap이 등록) */
  stopDrawingZone: (() => [number, number][]) | null

  /** 건물 선택 */
  selectBuilding: (building: Building | null) => void
  /** 바텀시트 스냅 포인트 변경 */
  setSnapPoint: (point: SnapPoint) => void
  /** 지도 준비 완료 */
  setMapReady: (ready: boolean) => void
  /** 지도 중심 변경 */
  setCenter: (lat: number, lng: number) => void
  /** 줌 레벨 변경 */
  setZoomLevel: (level: number) => void
  /** 그리기 함수 등록 */
  registerDrawingHandlers: (
    start: () => void,
    stop: () => [number, number][]
  ) => void
  /** 지도 중심 이동 함수 등록 */
  registerMoveToCenter: (fn: (lat: number, lng: number, level?: number) => void) => void
  /** 임시 핀 마커 표시 함수 (KakaoMap이 등록) */
  showTempMarker: ((lat: number, lng: number) => void) | null
  /** 임시 핀 마커 표시 함수 등록 */
  registerShowTempMarker: (fn: (lat: number, lng: number) => void) => void
  /** 지도 중심 이동 함수 (KakaoMap이 등록) */
  moveToCenter: ((lat: number, lng: number, level?: number) => void) | null
  /** 건물 위치 선택 모드 (지도 클릭으로 좌표 선택) */
  isPickingLocation: boolean
  /** 위치 선택 완료 콜백 */
  onLocationPicked: ((lat: number, lng: number, address: string) => void) | null
  /** 위치 선택 모드 시작 */
  startPickingLocation: (callback: (lat: number, lng: number, address: string) => void) => void
  /** 위치 선택 모드 종료 */
  stopPickingLocation: () => void
}

export const useMapStore = create<MapState>((set) => ({
  selectedBuilding: null,
  snapPoint: 'hidden',
  isMapReady: false,
  center: { lat: 37.5665, lng: 126.9780 },  // 서울 중심 기본값
  zoomLevel: 4,
  startDrawingZone: null,
  stopDrawingZone: null,
  moveToCenter: null,
  isPickingLocation: false,
  onLocationPicked: null,

  selectBuilding: (building) =>
    set({
      selectedBuilding: building,
      // 건물 선택 시 바텀시트 하프 오픈
      snapPoint: building ? 'half' : 'hidden',
    }),

  setSnapPoint: (point) => set({ snapPoint: point }),

  setMapReady: (ready) => set({ isMapReady: ready }),

  setCenter: (lat, lng) => set({ center: { lat, lng } }),

  setZoomLevel: (level) => set({ zoomLevel: level }),

  registerDrawingHandlers: (start, stop) =>
    set({ startDrawingZone: start, stopDrawingZone: stop }),

  registerMoveToCenter: (fn) => set({ moveToCenter: fn }),

  showTempMarker: null,
  registerShowTempMarker: (fn) => set({ showTempMarker: fn }),

  startPickingLocation: (callback) =>
    set({ isPickingLocation: true, onLocationPicked: callback }),

  stopPickingLocation: () =>
    set({ isPickingLocation: false, onLocationPicked: null }),
}))

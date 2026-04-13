// =====================================================
// BuildingNote 공통 타입 정의
// =====================================================

/** 구역 (지도 폴리곤) */
export interface Zone {
  id: string
  name: string
  polygon: [number, number][]  // [[위도, 경도], ...]
  color: string
  createdAt?: string
  updatedAt?: string
}

/** 건물 */
export interface Building {
  id: string
  name: string
  address?: string
  lat: number
  lng: number
  zoneId?: string
  zoneName?: string
  createdAt?: string
  updatedAt?: string
}

/** 호실 */
export interface Unit {
  id: string
  name: string
  floor?: number
  sortOrder: number
  buildingId: string
  createdAt?: string
  updatedAt?: string
}

/** 폼 필드 타입 */
export type FieldType = 'text' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'date' | 'number'

/** 폼 필드 정의 */
export interface FormField {
  id: string
  type: FieldType
  label: string
  options?: string[]     // checkbox, radio, select 용
  required?: boolean
  sortOrder: number
}

/** 건물별 폼 스키마 */
export interface FormSchema {
  id?: string
  buildingId: string
  fields: FormField[]
  updatedAt?: string
}

/** 호실 기록 데이터 */
export interface UnitRecord {
  id?: string
  unitId: string
  data: Record<string, string | string[]>  // { fieldId: value }
  createdAt?: string
  updatedAt?: string
}

/** 공통 API 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  code?: string
  timestamp?: string
}

/** 사용자 정보 */
export interface UserInfo {
  id: string
  email: string
  name?: string
  role: 'USER' | 'ADMIN'
}

/** 토큰 응답 */
export interface TokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: UserInfo
}

/** 호실 순서 변경 요청 */
export interface UnitReorderItem {
  id: string
  sortOrder: number
}

/** 바텀시트 스냅 포인트 */
export type SnapPoint = 'hidden' | 'half' | 'full'

/** Kakao 지도 window 타입 확장 */
declare global {
  interface Window {
    kakao: KakaoMaps
  }
}

/** Kakao Maps API 타입 (간략화) */
export interface KakaoMaps {
  maps: {
    load: (callback: () => void) => void
    Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap
    LatLng: new (lat: number, lng: number) => KakaoLatLng
    Marker: new (options: KakaoMarkerOptions) => KakaoMarker
    CustomOverlay: new (options: KakaoCustomOverlayOptions) => KakaoCustomOverlay
    Polygon: new (options: KakaoPolygonOptions) => KakaoPolygon
    Polyline: new (options: { path: KakaoLatLng[]; strokeColor: string; strokeOpacity: number; strokeWeight: number }) => KakaoPolyline
    event: {
      addListener: (target: unknown, type: string, handler: (...args: unknown[]) => void) => void
      removeListener: (target: unknown, type: string, handler: (...args: unknown[]) => void) => void
    }
    MapTypeId: { ROADMAP: string }
    services: {
      Geocoder: new () => KakaoGeocoder
      Status: { OK: string }
    }
  }
}

export interface KakaoGeocoder {
  coord2Address: (
    lng: number,
    lat: number,
    callback: (result: KakaoAddressResult[], status: string) => void
  ) => void
  addressSearch: (
    address: string,
    callback: (result: KakaoAddressSearchResult[], status: string) => void
  ) => void
}

export interface KakaoAddressResult {
  address: { address_name: string }
  road_address: { address_name: string } | null
}

export interface KakaoAddressSearchResult {
  address_name: string
  road_address_name?: string
  x: string  // 경도(lng)
  y: string  // 위도(lat)
}

export interface KakaoMapOptions {
  center: KakaoLatLng
  level: number
}

export interface KakaoMarkerOptions {
  position: KakaoLatLng
  map?: KakaoMap
  title?: string
  image?: KakaoMarkerImage
}

export interface KakaoCustomOverlayOptions {
  position: KakaoLatLng
  content: string | HTMLElement
  map?: KakaoMap
  yAnchor?: number
}

export interface KakaoPolygonOptions {
  path: KakaoLatLng[]
  strokeWeight?: number
  strokeColor?: string
  strokeOpacity?: number
  fillColor?: string
  fillOpacity?: number
  map?: KakaoMap
}

export interface KakaoLatLng {
  getLat: () => number
  getLng: () => number
}

export interface KakaoMap {
  setCenter: (latlng: KakaoLatLng) => void
  getCenter: () => KakaoLatLng
  setLevel: (level: number) => void
  getLevel: () => number
  relayout: () => void
}

export interface KakaoMarker {
  setMap: (map: KakaoMap | null) => void
  getPosition: () => KakaoLatLng
}

export interface KakaoCustomOverlay {
  setMap: (map: KakaoMap | null) => void
}

export interface KakaoPolygon {
  setMap: (map: KakaoMap | null) => void
}

export interface KakaoPolyline {
  setMap: (map: KakaoMap | null) => void
  setPath: (path: KakaoLatLng[]) => void
}

export interface KakaoMarkerImage {
  src: string
  size: { width: number; height: number }
}

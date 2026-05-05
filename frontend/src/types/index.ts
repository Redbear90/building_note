// =====================================================
// BuildingNote 공통 타입
// =====================================================

export type Role = 'ADMIN' | 'BUILDING_OWNER' | 'MEMBER'

/** 워크스페이스 */
export interface Organization {
  id: string
  name: string
  inviteCode: string
  createdAt?: string
}

/** 워크스페이스 멤버 */
export interface Member {
  id: string
  email: string
  name?: string
  role: Role
  createdAt?: string
}

/** 구역 (지도 폴리곤) */
export interface Zone {
  id: string
  name: string
  polygon: [number, number][]
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
  isActive: boolean
  buildingId: string
  lastCommentAt?: string
  createdAt?: string
  updatedAt?: string
}

export type FieldType = 'text' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'date' | 'number'

export interface FormField {
  id: string
  type: FieldType
  label: string
  options?: string[]
  required?: boolean
  sortOrder: number
  isStatusField?: boolean
}

export interface FormSchema {
  id?: string
  buildingId: string
  fields: FormField[]
  updatedAt?: string
}

export interface UnitComment {
  id: string
  unitId: string
  authorId: string
  authorName?: string
  content: string
  createdAt: string
}

export interface UnitRecord {
  id?: string
  unitId: string
  authorId?: string
  authorName?: string
  data: Record<string, string | string[]>
  createdAt?: string
  updatedAt?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  code?: string
  timestamp?: string
}

export interface UserInfo {
  id: string
  email: string
  name?: string
  role: Role
  organizationId?: string | null
  organizationName?: string | null
  inviteCode?: string | null
}

export interface TokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: UserInfo
}

export interface UnitReorderItem {
  id: string
  sortOrder: number
}

export type SnapPoint = 'hidden' | 'half' | 'full'

declare global {
  interface Window {
    kakao: KakaoMaps
  }
}

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
      Places: new () => KakaoPlaces
      Status: { OK: string; ZERO_RESULT: string; ERROR: string }
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

export interface KakaoPlaces {
  categorySearch: (
    code: string,
    callback: (result: KakaoPlaceResult[], status: string, pagination: { hasNextPage: boolean; nextPage: () => void }) => void,
    options?: { rect?: string; useMapBounds?: boolean }
  ) => void
  keywordSearch: (
    keyword: string,
    callback: (result: KakaoPlaceResult[], status: string, pagination: { hasNextPage: boolean; nextPage: () => void }) => void,
    options?: { rect?: string; size?: number }
  ) => void
}

export interface KakaoAddressResult {
  address: { address_name: string }
  road_address: { address_name: string } | null
}

export interface KakaoAddressSearchResult {
  address_name: string
  road_address_name?: string
  x: string
  y: string
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
  getBounds: () => KakaoBounds
  relayout: () => void
}

export interface KakaoBounds {
  getSouthWest: () => KakaoLatLng
  getNorthEast: () => KakaoLatLng
}

export interface KakaoPlaceResult {
  id: string
  place_name: string
  address_name: string
  road_address_name: string
  x: string
  y: string
  category_name: string
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

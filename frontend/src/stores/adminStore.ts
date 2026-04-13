import { create } from 'zustand'
import type { Building, Unit } from '@/types'

/** 관리자 스토어 상태 타입 */
interface AdminState {
  /** 관리자 패널 열림 여부 */
  isPanelOpen: boolean
  /** 현재 관리자 패널 탭 */
  activeTab: 'buildings' | 'zones' | 'formBuilder'
  /** 폼 빌더에서 편집 중인 건물 */
  editingBuilding: Building | null
  /** 폼 빌더에서 편집 중인 호실 */
  editingUnit: Unit | null
  /** 구역 그리기 모드 활성화 여부 */
  isDrawingZone: boolean

  /** 패널 토글 */
  togglePanel: () => void
  /** 패널 열기/닫기 */
  setPanel: (open: boolean) => void
  /** 탭 변경 */
  setActiveTab: (tab: AdminState['activeTab']) => void
  /** 편집 건물 설정 */
  setEditingBuilding: (building: Building | null) => void
  /** 편집 호실 설정 */
  setEditingUnit: (unit: Unit | null) => void
  /** 구역 그리기 모드 토글 */
  toggleDrawingZone: () => void
}

export const useAdminStore = create<AdminState>((set) => ({
  isPanelOpen: false,
  activeTab: 'buildings',
  editingBuilding: null,
  editingUnit: null,
  isDrawingZone: false,

  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

  setPanel: (open) => set({ isPanelOpen: open }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setEditingBuilding: (building) => set({ editingBuilding: building }),

  setEditingUnit: (unit) => set({ editingUnit: unit }),

  toggleDrawingZone: () => set((state) => ({ isDrawingZone: !state.isDrawingZone })),
}))

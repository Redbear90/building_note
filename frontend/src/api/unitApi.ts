import axiosInstance from './axiosInstance'
import type { ApiResponse, Unit, UnitReorderItem } from '@/types'

/** 호실 API */
export const unitApi = {
  /** 전체 호실 수 조회 */
  getTotalCount: async (): Promise<number> => {
    const { data } = await axiosInstance.get<ApiResponse<number>>('/units/count')
    return data.data
  },

  /** 호실 통계 조회 (전체/동의/미참여) */
  getStats: async (): Promise<{ total: number; active: number; inactive: number }> => {
    const { data } = await axiosInstance.get<ApiResponse<{ total: number; active: number; inactive: number }>>('/units/stats')
    return data.data
  },

  /** 건물의 호실 목록 조회 */
  getByBuilding: async (buildingId: string): Promise<Unit[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Unit[]>>(`/buildings/${buildingId}/units`)
    return data.data
  },

  /** 호실 추가 */
  create: async (
    buildingId: string,
    payload: { name: string; floor?: number; sortOrder?: number }
  ): Promise<Unit> => {
    const { data } = await axiosInstance.post<ApiResponse<Unit>>(
      `/buildings/${buildingId}/units`,
      payload
    )
    return data.data
  },

  /** 호실 수정 */
  update: async (
    unitId: string,
    payload: { name: string; floor?: number; sortOrder?: number }
  ): Promise<Unit> => {
    const { data } = await axiosInstance.patch<ApiResponse<Unit>>(`/units/${unitId}`, payload)
    return data.data
  },

  /** 호실 삭제 */
  delete: async (unitId: string): Promise<void> => {
    await axiosInstance.delete(`/units/${unitId}`)
  },

  /** 호실 순서 일괄 변경 */
  reorder: async (buildingId: string, items: UnitReorderItem[]): Promise<Unit[]> => {
    const { data } = await axiosInstance.patch<ApiResponse<Unit[]>>(
      `/buildings/${buildingId}/units/reorder`,
      { items }
    )
    return data.data
  },
}

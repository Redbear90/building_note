import axiosInstance from './axiosInstance'
import type { ApiResponse, Unit, UnitReorderItem } from '@/types'

export const unitApi = {
  getTotalCount: async (): Promise<number> => {
    const { data } = await axiosInstance.get<ApiResponse<number>>('/units/count')
    return data.data
  },

  getStats: async (): Promise<{ total: number; active: number; inactive: number }> => {
    const { data } = await axiosInstance.get<
      ApiResponse<{ total: number; active: number; inactive: number }>
    >('/units/stats')
    return data.data
  },

  getByBuilding: async (buildingId: string): Promise<Unit[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Unit[]>>(`/buildings/${buildingId}/units`)
    return data.data
  },

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

  update: async (
    unitId: string,
    payload: { name: string; floor?: number; sortOrder?: number }
  ): Promise<Unit> => {
    const { data } = await axiosInstance.patch<ApiResponse<Unit>>(`/units/${unitId}`, payload)
    return data.data
  },

  delete: async (unitId: string): Promise<void> => {
    await axiosInstance.delete(`/units/${unitId}`)
  },

  reorder: async (buildingId: string, items: UnitReorderItem[]): Promise<Unit[]> => {
    const { data } = await axiosInstance.patch<ApiResponse<Unit[]>>(
      `/buildings/${buildingId}/units/reorder`,
      { items }
    )
    return data.data
  },

  /** 슬라이드 버튼 토글 */
  setActive: async (unitId: string, active: boolean): Promise<Unit> => {
    const { data } = await axiosInstance.patch<ApiResponse<Unit>>(`/units/${unitId}/active`, {
      active,
    })
    return data.data
  },
}

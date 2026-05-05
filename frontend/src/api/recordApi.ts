import axiosInstance from './axiosInstance'
import type { ApiResponse, UnitRecord } from '@/types'

/**
 * 호실 기록은 멤버별 1건. GET/PUT 모두 본인 기록.
 * 삭제는 record id 기반 soft delete.
 */
export const recordApi = {
  /** 내 호실 기록 조회 */
  getMine: async (unitId: string): Promise<UnitRecord> => {
    const { data } = await axiosInstance.get<ApiResponse<UnitRecord>>(`/units/${unitId}/record/me`)
    return data.data
  },

  /** 호실 내 모든 멤버의 기록 (BUILDING_OWNER 전용) */
  getAll: async (unitId: string): Promise<UnitRecord[]> => {
    const { data } = await axiosInstance.get<ApiResponse<UnitRecord[]>>(`/units/${unitId}/records`)
    return data.data
  },

  /** 내 호실 기록 저장 */
  saveMine: async (
    unitId: string,
    recordData: Record<string, string | string[]>
  ): Promise<UnitRecord> => {
    const { data } = await axiosInstance.put<ApiResponse<UnitRecord>>(`/units/${unitId}/record/me`, {
      data: recordData,
    })
    return data.data
  },

  /** 기록 soft delete */
  delete: async (recordId: string): Promise<void> => {
    await axiosInstance.delete(`/records/${recordId}`)
  },
}

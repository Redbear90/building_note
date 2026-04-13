import axiosInstance from './axiosInstance'
import type { ApiResponse, UnitRecord } from '@/types'

/** 호실 기록 API */
export const recordApi = {
  /** 호실 기록 조회 */
  getByUnit: async (unitId: string): Promise<UnitRecord> => {
    const { data } = await axiosInstance.get<ApiResponse<UnitRecord>>(`/units/${unitId}/record`)
    return data.data
  },

  /** 호실 기록 저장 (upsert) */
  save: async (
    unitId: string,
    recordData: Record<string, string | string[]>
  ): Promise<UnitRecord> => {
    const { data } = await axiosInstance.put<ApiResponse<UnitRecord>>(`/units/${unitId}/record`, {
      data: recordData,
    })
    return data.data
  },
}

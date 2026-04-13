import axiosInstance from './axiosInstance'
import type { ApiResponse, Zone } from '@/types'

/** 구역 API */
export const zoneApi = {
  /** 전체 구역 목록 조회 */
  getAll: async (): Promise<Zone[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Zone[]>>('/zones')
    return data.data
  },

  /** 구역 생성 */
  create: async (payload: { name: string; polygon: [number, number][]; color?: string }): Promise<Zone> => {
    const { data } = await axiosInstance.post<ApiResponse<Zone>>('/zones', payload)
    return data.data
  },

  /** 구역 수정 */
  update: async (
    zoneId: string,
    payload: { name: string; polygon: [number, number][]; color?: string }
  ): Promise<Zone> => {
    const { data } = await axiosInstance.patch<ApiResponse<Zone>>(`/zones/${zoneId}`, payload)
    return data.data
  },

  /** 구역 삭제 */
  delete: async (zoneId: string): Promise<void> => {
    await axiosInstance.delete(`/zones/${zoneId}`)
  },
}

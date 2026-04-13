import axiosInstance from './axiosInstance'
import type { ApiResponse, Building } from '@/types'

/** 건물 API */
export const buildingApi = {
  /** 건물 목록 조회 (zoneId 필터 선택) */
  getAll: async (zoneId?: string): Promise<Building[]> => {
    const params = zoneId ? { zoneId } : {}
    const { data } = await axiosInstance.get<ApiResponse<Building[]>>('/buildings', { params })
    return data.data
  },

  /** 건물 상세 조회 */
  getById: async (buildingId: string): Promise<Building> => {
    const { data } = await axiosInstance.get<ApiResponse<Building>>(`/buildings/${buildingId}`)
    return data.data
  },

  /** 건물 생성 */
  create: async (payload: {
    name: string
    address?: string
    lat: number
    lng: number
    zoneId?: string
  }): Promise<Building> => {
    const { data } = await axiosInstance.post<ApiResponse<Building>>('/buildings', payload)
    return data.data
  },

  /** 건물 수정 */
  update: async (
    buildingId: string,
    payload: { name: string; address?: string; lat: number; lng: number; zoneId?: string }
  ): Promise<Building> => {
    const { data } = await axiosInstance.patch<ApiResponse<Building>>(`/buildings/${buildingId}`, payload)
    return data.data
  },

  /** 건물 삭제 */
  delete: async (buildingId: string): Promise<void> => {
    await axiosInstance.delete(`/buildings/${buildingId}`)
  },
}

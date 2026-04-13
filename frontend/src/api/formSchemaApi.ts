import axiosInstance from './axiosInstance'
import type { ApiResponse, FormSchema } from '@/types'

/** 폼 스키마 API */
export const formSchemaApi = {
  /** 건물의 폼 스키마 조회 */
  getByBuilding: async (buildingId: string): Promise<FormSchema> => {
    const { data } = await axiosInstance.get<ApiResponse<FormSchema>>(
      `/buildings/${buildingId}/form-schema`
    )
    return data.data
  },

  /** 폼 스키마 저장/전체교체 */
  save: async (buildingId: string, schema: Omit<FormSchema, 'buildingId' | 'id'>): Promise<FormSchema> => {
    const { data } = await axiosInstance.put<ApiResponse<FormSchema>>(
      `/buildings/${buildingId}/form-schema`,
      schema
    )
    return data.data
  },
}

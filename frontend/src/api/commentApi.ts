import axiosInstance from './axiosInstance'
import type { ApiResponse, UnitComment } from '@/types'

export const commentApi = {
  getByUnit: async (unitId: string): Promise<UnitComment[]> => {
    const { data } = await axiosInstance.get<ApiResponse<UnitComment[]>>(`/units/${unitId}/comments`)
    return data.data
  },

  add: async (unitId: string, content: string): Promise<UnitComment> => {
    const { data } = await axiosInstance.post<ApiResponse<UnitComment>>(
      `/units/${unitId}/comments`,
      { content }
    )
    return data.data
  },

  /** soft delete */
  delete: async (unitId: string, commentId: string): Promise<void> => {
    await axiosInstance.delete(`/units/${unitId}/comments/${commentId}`)
  },
}

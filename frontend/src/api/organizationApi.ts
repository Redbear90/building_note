import axiosInstance from './axiosInstance'
import type { ApiResponse, Member, Organization } from '@/types'

export const organizationApi = {
  getMine: async (): Promise<Organization> => {
    const { data } = await axiosInstance.get<ApiResponse<Organization>>('/organization/me')
    return data.data
  },

  listMembers: async (): Promise<Member[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Member[]>>('/organization/members')
    return data.data
  },

  rotateInviteCode: async (): Promise<Organization> => {
    const { data } = await axiosInstance.post<ApiResponse<Organization>>(
      '/organization/invite-code/rotate'
    )
    return data.data
  },

  removeMember: async (memberId: string): Promise<void> => {
    await axiosInstance.delete(`/organization/members/${memberId}`)
  },
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { organizationApi } from '@/api/organizationApi'

export const orgKeys = {
  me: ['organization', 'me'] as const,
  members: ['organization', 'members'] as const,
}

export const useMyOrganization = () =>
  useQuery({ queryKey: orgKeys.me, queryFn: () => organizationApi.getMine() })

export const useMembers = () =>
  useQuery({ queryKey: orgKeys.members, queryFn: () => organizationApi.listMembers() })

export const useRotateInviteCode = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => organizationApi.rotateInviteCode(),
    onSuccess: (org) => queryClient.setQueryData(orgKeys.me, org),
  })
}

export const useRemoveMember = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) => organizationApi.removeMember(memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orgKeys.members }),
  })
}

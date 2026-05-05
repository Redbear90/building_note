import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commentApi } from '@/api/commentApi'
import { unitKeys } from './useUnitQueries'

export const commentKeys = {
  all: ['comments'] as const,
  byUnit: (unitId: string) => [...commentKeys.all, 'unit', unitId] as const,
}

export const useUnitComments = (unitId: string) => {
  return useQuery({
    queryKey: commentKeys.byUnit(unitId),
    queryFn: () => commentApi.getByUnit(unitId),
    staleTime: 1000 * 30,
  })
}

export const useAddComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, content }: { unitId: string; content: string }) =>
      commentApi.add(unitId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byUnit(variables.unitId) })
      queryClient.invalidateQueries({ queryKey: unitKeys.all })
    },
  })
}

export const useDeleteComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, commentId }: { unitId: string; commentId: string }) =>
      commentApi.delete(unitId, commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byUnit(variables.unitId) })
      queryClient.invalidateQueries({ queryKey: unitKeys.all })
    },
  })
}

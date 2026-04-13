import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commentApi } from '@/api/commentApi'
import { unitKeys } from './useUnitQueries'

export const commentKeys = {
  all: ['comments'] as const,
  byUnit: (unitId: string) => [...commentKeys.all, 'unit', unitId] as const,
}

/** 호실 댓글 목록 조회 */
export const useUnitComments = (unitId: string) => {
  return useQuery({
    queryKey: commentKeys.byUnit(unitId),
    queryFn: () => commentApi.getByUnit(unitId),
    staleTime: 1000 * 30,  // 30초
  })
}

/** 댓글 작성 */
export const useAddComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, author, content }: { unitId: string; author: string; content: string }) =>
      commentApi.add(unitId, author, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byUnit(variables.unitId) })
      // 호실 목록의 lastCommentAt 갱신 → NEW 배지 즉시 반영
      queryClient.invalidateQueries({ queryKey: unitKeys.all })
    },
  })
}

/** 댓글 삭제 */
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

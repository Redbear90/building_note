import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zoneApi } from '@/api/zoneApi'
import type { Zone } from '@/types'

export const zoneKeys = {
  all: ['zones'] as const,
  list: () => [...zoneKeys.all, 'list'] as const,
}

/** 구역 목록 조회 */
export const useZones = () => {
  return useQuery({
    queryKey: zoneKeys.list(),
    queryFn: zoneApi.getAll,
    staleTime: 1000 * 60 * 10,  // 10분
  })
}

/** 구역 생성 */
export const useCreateZone = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<Zone, 'id' | 'createdAt' | 'updatedAt'>) =>
      zoneApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.all })
    },
  })
}

/** 구역 수정 */
export const useUpdateZone = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Zone> & { id: string }) =>
      zoneApi.update(id, payload as Parameters<typeof zoneApi.update>[1]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.all })
    },
  })
}

/** 구역 삭제 */
export const useDeleteZone = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (zoneId: string) => zoneApi.delete(zoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.all })
    },
  })
}

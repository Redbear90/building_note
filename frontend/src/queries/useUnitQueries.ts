import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { unitApi } from '@/api/unitApi'
import type { Unit, UnitReorderItem } from '@/types'

export const unitKeys = {
  all: ['units'] as const,
  byBuilding: (buildingId: string) => [...unitKeys.all, 'building', buildingId] as const,
}

/** 건물의 호실 목록 조회 */
export const useUnits = (buildingId: string | null) => {
  return useQuery({
    queryKey: unitKeys.byBuilding(buildingId!),
    queryFn: () => unitApi.getByBuilding(buildingId!),
    enabled: !!buildingId,
    staleTime: 1000 * 60 * 5,
  })
}

/** 호실 추가 */
export const useCreateUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      buildingId,
      ...payload
    }: { buildingId: string } & Omit<Unit, 'id' | 'buildingId' | 'createdAt' | 'updatedAt'>) =>
      unitApi.create(buildingId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: unitKeys.byBuilding(variables.buildingId) })
    },
  })
}

/** 호실 수정 */
export const useUpdateUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      unitId,
      buildingId,
      ...payload
    }: { unitId: string; buildingId: string } & Partial<Unit>) =>
      unitApi.update(unitId, payload as Parameters<typeof unitApi.update>[1]),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: unitKeys.byBuilding(variables.buildingId) })
    },
  })
}

/** 호실 삭제 */
export const useDeleteUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId }: { unitId: string; buildingId: string }) =>
      unitApi.delete(unitId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: unitKeys.byBuilding(variables.buildingId) })
    },
  })
}

/** 호실 순서 변경 */
export const useReorderUnits = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ buildingId, items }: { buildingId: string; items: UnitReorderItem[] }) =>
      unitApi.reorder(buildingId, items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: unitKeys.byBuilding(variables.buildingId) })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { unitApi } from '@/api/unitApi'
import type { Unit, UnitReorderItem } from '@/types'

export const unitKeys = {
  all: ['units'] as const,
  count: ['units', 'count'] as const,
  stats: ['units', 'stats'] as const,
  byBuilding: (buildingId: string) => [...unitKeys.all, 'building', buildingId] as const,
}

export const useTotalUnitCount = () => {
  return useQuery({
    queryKey: unitKeys.count,
    queryFn: () => unitApi.getTotalCount(),
    staleTime: 1000 * 60 * 5,
  })
}

export const useUnitStats = () => {
  return useQuery({
    queryKey: unitKeys.stats,
    queryFn: () => unitApi.getStats(),
    staleTime: 1000 * 60 * 5,
  })
}

export const useUnits = (buildingId: string | null) => {
  return useQuery({
    queryKey: unitKeys.byBuilding(buildingId!),
    queryFn: () => unitApi.getByBuilding(buildingId!),
    enabled: !!buildingId,
    staleTime: 1000 * 60 * 5,
  })
}

export const useCreateUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      buildingId,
      ...payload
    }: { buildingId: string } & Omit<Unit, 'id' | 'buildingId' | 'isActive' | 'createdAt' | 'updatedAt'>) =>
      unitApi.create(buildingId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: unitKeys.byBuilding(variables.buildingId) })
    },
  })
}

export const useUpdateUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      unitId,
      ...payload
    }: { unitId: string; buildingId: string } & Partial<Unit>) =>
      unitApi.update(unitId, payload as Parameters<typeof unitApi.update>[1]),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: unitKeys.byBuilding(variables.buildingId) })
    },
  })
}

export const useDeleteUnit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId }: { unitId: string; buildingId: string }) => unitApi.delete(unitId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: unitKeys.byBuilding(variables.buildingId) })
    },
  })
}

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

/** 슬라이드 버튼 토글 */
export const useSetUnitActive = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, active }: { unitId: string; buildingId: string; active: boolean }) =>
      unitApi.setActive(unitId, active),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: unitKeys.byBuilding(variables.buildingId) })
      queryClient.invalidateQueries({ queryKey: unitKeys.stats })
    },
  })
}

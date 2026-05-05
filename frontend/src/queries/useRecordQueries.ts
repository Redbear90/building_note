import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { recordApi } from '@/api/recordApi'
import { unitKeys } from './useUnitQueries'

export const recordKeys = {
  all: ['records'] as const,
  mineByUnit: (unitId: string) => [...recordKeys.all, 'mine', unitId] as const,
  allByUnit: (unitId: string) => [...recordKeys.all, 'all', unitId] as const,
}

/** 내 호실 기록 */
export const useMyUnitRecord = (unitId: string | null) => {
  return useQuery({
    queryKey: recordKeys.mineByUnit(unitId!),
    queryFn: () => recordApi.getMine(unitId!),
    enabled: !!unitId,
  })
}

/** 호실 내 모든 멤버 기록 (BUILDING_OWNER) */
export const useAllUnitRecords = (unitId: string | null) => {
  return useQuery({
    queryKey: recordKeys.allByUnit(unitId!),
    queryFn: () => recordApi.getAll(unitId!),
    enabled: !!unitId,
  })
}

/** 내 기록 저장 */
export const useSaveMyRecord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, data }: { unitId: string; data: Record<string, string | string[]> }) =>
      recordApi.saveMine(unitId, data),
    onSuccess: (saved, variables) => {
      queryClient.setQueryData(recordKeys.mineByUnit(variables.unitId), saved)
      queryClient.invalidateQueries({ queryKey: recordKeys.allByUnit(variables.unitId) })
      queryClient.invalidateQueries({ queryKey: unitKeys.all })
    },
  })
}

/** 기록 soft delete */
export const useDeleteRecord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ recordId }: { recordId: string; unitId: string }) =>
      recordApi.delete(recordId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: recordKeys.mineByUnit(variables.unitId) })
      queryClient.invalidateQueries({ queryKey: recordKeys.allByUnit(variables.unitId) })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { recordApi } from '@/api/recordApi'

export const recordKeys = {
  all: ['records'] as const,
  byUnit: (unitId: string) => [...recordKeys.all, 'unit', unitId] as const,
}

/** 호실 기록 조회 */
export const useUnitRecord = (unitId: string | null) => {
  return useQuery({
    queryKey: recordKeys.byUnit(unitId!),
    queryFn: () => recordApi.getByUnit(unitId!),
    enabled: !!unitId,
    // staleTime 기본값 0 — 저장 후 즉시 재조회
  })
}

/** 호실 기록 저장 */
export const useSaveRecord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      unitId,
      data,
    }: {
      unitId: string
      data: Record<string, string | string[]>
    }) => recordApi.save(unitId, data),
    onSuccess: (savedRecord, variables) => {
      // 즉시 캐시 업데이트 → UnitCard 색상 즉시 반영
      queryClient.setQueryData(recordKeys.byUnit(variables.unitId), savedRecord)
    },
  })
}

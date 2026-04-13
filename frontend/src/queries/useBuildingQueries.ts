import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { buildingApi } from '@/api/buildingApi'
import type { Building } from '@/types'

/** 쿼리 키 상수 */
export const buildingKeys = {
  all: ['buildings'] as const,
  list: (zoneId?: string) => [...buildingKeys.all, 'list', { zoneId }] as const,
  detail: (id: string) => [...buildingKeys.all, 'detail', id] as const,
}

/** 건물 목록 조회 훅 */
export const useBuildings = (zoneId?: string) => {
  return useQuery({
    queryKey: buildingKeys.list(zoneId),
    queryFn: () => buildingApi.getAll(zoneId),
    staleTime: 1000 * 60 * 5,  // 5분
  })
}

/** 건물 상세 조회 훅 */
export const useBuilding = (buildingId: string | null) => {
  return useQuery({
    queryKey: buildingKeys.detail(buildingId!),
    queryFn: () => buildingApi.getById(buildingId!),
    enabled: !!buildingId,
    staleTime: 1000 * 60 * 5,
  })
}

/** 건물 생성 뮤테이션 */
export const useCreateBuilding = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<Building, 'id' | 'createdAt' | 'updatedAt'>) =>
      buildingApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildingKeys.all })
    },
  })
}

/** 건물 수정 뮤테이션 */
export const useUpdateBuilding = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Building> & { id: string }) =>
      buildingApi.update(id, payload as Parameters<typeof buildingApi.update>[1]),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: buildingKeys.all })
      queryClient.invalidateQueries({ queryKey: buildingKeys.detail(variables.id) })
    },
  })
}

/** 건물 삭제 뮤테이션 */
export const useDeleteBuilding = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (buildingId: string) => buildingApi.delete(buildingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildingKeys.all })
    },
  })
}

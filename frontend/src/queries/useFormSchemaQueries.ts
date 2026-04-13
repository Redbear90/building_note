import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formSchemaApi } from '@/api/formSchemaApi'
import type { FormSchema } from '@/types'

export const formSchemaKeys = {
  all: ['formSchemas'] as const,
  byBuilding: (buildingId: string) => [...formSchemaKeys.all, 'building', buildingId] as const,
}

/** 건물의 폼 스키마 조회 */
export const useFormSchema = (buildingId: string | null) => {
  return useQuery({
    queryKey: formSchemaKeys.byBuilding(buildingId!),
    queryFn: () => formSchemaApi.getByBuilding(buildingId!),
    enabled: !!buildingId,
    staleTime: 1000 * 60 * 10,
  })
}

/** 폼 스키마 저장 */
export const useSaveFormSchema = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      buildingId,
      schema,
    }: {
      buildingId: string
      schema: Omit<FormSchema, 'buildingId' | 'id'>
    }) => formSchemaApi.save(buildingId, schema),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: formSchemaKeys.byBuilding(variables.buildingId),
      })
    },
  })
}

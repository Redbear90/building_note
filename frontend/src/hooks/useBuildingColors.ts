import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { unitKeys } from '@/queries/useUnitQueries'
import type { Building, Unit } from '@/types'

export type BuildingColor = 'gray' | 'red' | 'yellow' | 'blue' | 'green'

/**
 * 모든 건물의 상태 색상을 unit.is_active 비율 기준으로 계산한다.
 * React Query 캐시의 unit 쿼리가 변경되면 자동 재계산.
 */
export const useBuildingColors = (buildings: Building[]): Record<string, BuildingColor> => {
  const queryClient = useQueryClient()
  const [colorMap, setColorMap] = useState<Record<string, BuildingColor>>({})

  const computeColors = useCallback(() => {
    const next: Record<string, BuildingColor> = {}
    for (const building of buildings) {
      const units = queryClient.getQueryData<Unit[]>(unitKeys.byBuilding(building.id))
      if (!units || units.length === 0) {
        next[building.id] = 'gray'
        continue
      }
      const activeCount = units.filter((u) => u.isActive).length
      const ratio = activeCount / units.length
      if (ratio === 1) next[building.id] = 'green'
      else if (ratio >= 0.5) next[building.id] = 'blue'
      else if (ratio > 0) next[building.id] = 'yellow'
      else next[building.id] = 'red'
    }
    return next
  }, [buildings, queryClient])

  useEffect(() => {
    setColorMap(computeColors())
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated') {
        const key = event.query.queryKey
        if (Array.isArray(key) && key[0] === 'units') {
          setColorMap(computeColors())
        }
      }
    })
    return unsubscribe
  }, [computeColors, queryClient])

  return colorMap
}

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { unitKeys } from '@/queries/useUnitQueries'
import { recordKeys } from '@/queries/useRecordQueries'
import type { Building, Unit } from '@/types'

export type BuildingColor = 'gray' | 'red' | 'yellow' | 'blue'

/**
 * 모든 건물의 상태 색상을 계산하는 훅
 * React Query 캐시에서 유닛/레코드 데이터를 읽어 색상을 결정한다.
 * 캐시가 변경될 때마다 자동으로 재계산한다.
 */
export const useBuildingColors = (buildings: Building[]): Record<string, BuildingColor> => {
  const queryClient = useQueryClient()
  const [colorMap, setColorMap] = useState<Record<string, BuildingColor>>({})

  const computeColors = () => {
    const next: Record<string, BuildingColor> = {}

    for (const building of buildings) {
      const units = queryClient.getQueryData<Unit[]>(
        unitKeys.byBuilding(building.id)
      )

      if (!units || units.length === 0) {
        next[building.id] = 'gray'
        continue
      }

      let activeCount = 0
      for (const unit of units) {
        const record = queryClient.getQueryData<{ data?: Record<string, string> }>(
          recordKeys.byUnit(unit.id)
        )
        if (record?.data?.['__active'] === 'true') {
          activeCount++
        }
      }

      const ratio = activeCount / units.length
      if (ratio === 1) {
        next[building.id] = 'blue'
      } else if (ratio > 0) {
        next[building.id] = 'yellow'
      } else {
        next[building.id] = 'red'
      }
    }

    return next
  }

  useEffect(() => {
    // 초기 계산
    setColorMap(computeColors())

    // 캐시 변경 구독 — unit 또는 record 쿼리가 업데이트되면 재계산
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated') {
        const key = event.query.queryKey
        if (
          Array.isArray(key) &&
          key.length > 0 &&
          (key[0] === 'units' || key[0] === 'records')
        ) {
          setColorMap(computeColors())
        }
      }
    })

    return unsubscribe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildings, queryClient])

  return colorMap
}

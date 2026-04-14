import React from 'react'
import { Building2 } from 'lucide-react'
import { useUnits } from '@/queries/useUnitQueries'
import { useUnitRecord } from '@/queries/useRecordQueries'
import type { Unit } from '@/types'

interface BuildingStatusIconProps {
  buildingId: string
  className?: string
}

/** 단일 유닛의 __active 상태를 읽어오는 내부 컴포넌트 */
const UnitActiveReader: React.FC<{ unit: Unit; onResult: (active: boolean) => void }> = ({ unit, onResult }) => {
  const { data: record } = useUnitRecord(unit.id)
  const isActive = record?.data?.['__active'] === 'true'
  // 렌더마다 결과를 부모에 알림 (ref callback 방식 불가하므로 useEffect 사용)
  React.useEffect(() => { onResult(isActive) }, [isActive, onResult])
  return null
}

/**
 * 건물 목록 아이콘 — __active 비율에 따라 색상 변경
 * 0% → 빨강, 1~99% → 노랑, 100% → 파랑
 */
export const BuildingStatusIcon: React.FC<BuildingStatusIconProps> = ({ buildingId, className }) => {
  const { data: units = [] } = useUnits(buildingId)
  const [activeMap, setActiveMap] = React.useState<Record<string, boolean>>({})

  const handleResult = React.useCallback((unitId: string, active: boolean) => {
    setActiveMap((prev) => {
      if (prev[unitId] === active) return prev
      return { ...prev, [unitId]: active }
    })
  }, [])

  const total = units.length
  const activeCount = Object.values(activeMap).filter(Boolean).length
  const ratio = total === 0 ? 0 : activeCount / total

  // 색상 결정
  let iconColor = 'text-red-500'
  let bgColor = 'bg-red-50'
  if (total === 0) {
    iconColor = 'text-gray-400'
    bgColor = 'bg-gray-100'
  } else if (ratio === 1) {
    iconColor = 'text-blue-500'
    bgColor = 'bg-blue-50'
  } else if (ratio > 0) {
    iconColor = 'text-yellow-500'
    bgColor = 'bg-yellow-50'
  }

  return (
    <>
      {/* 유닛별 레코드 읽기 (렌더 없음) */}
      {units.map((unit) => (
        <UnitActiveReader
          key={unit.id}
          unit={unit}
          onResult={(active) => handleResult(unit.id, active)}
        />
      ))}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${bgColor} ${className ?? ''}`}>
        <Building2 className={`w-4 h-4 ${iconColor}`} />
      </div>
    </>
  )
}

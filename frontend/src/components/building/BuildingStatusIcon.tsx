import React from 'react'
import { Building2 } from 'lucide-react'
import { useUnits } from '@/queries/useUnitQueries'

interface BuildingStatusIconProps {
  buildingId: string
  className?: string
}

/**
 * 건물 아이콘 — unit.is_active 비율에 따라 색상 결정.
 * 0 → 빨강, 1~99% → 노랑, 100% → 파랑, 호실 0개 → 회색.
 */
export const BuildingStatusIcon: React.FC<BuildingStatusIconProps> = ({ buildingId, className }) => {
  const { data: units = [] } = useUnits(buildingId)
  const total = units.length
  const activeCount = units.filter((u) => u.isActive).length
  const ratio = total === 0 ? 0 : activeCount / total

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
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${bgColor} ${className ?? ''}`}>
      <Building2 className={`w-4 h-4 ${iconColor}`} />
    </div>
  )
}

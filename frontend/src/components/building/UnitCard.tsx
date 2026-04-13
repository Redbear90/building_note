import React from 'react'
import { cn } from '@/lib/utils'
import type { Unit, UnitRecord } from '@/types'

interface UnitCardProps {
  unit: Unit
  record?: UnitRecord
  onClick: (unit: Unit) => void
}

/** 입주 상태별 색상 */
const STATUS_COLOR: Record<string, string> = {
  입주: 'bg-green-100 text-green-700 border-green-200',
  공실: 'bg-gray-100 text-gray-600 border-gray-200',
  공사중: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

/**
 * 호실 카드 컴포넌트
 * 그리드에서 개별 호실을 표시
 */
export const UnitCard: React.FC<UnitCardProps> = ({ unit, record, onClick }) => {
  // record.data에서 입주 상태 추출 (f2: 입주상태 필드)
  const status = record?.data?.['f2'] as string | undefined

  return (
    <button
      onClick={() => onClick(unit)}
      className={cn(
        'w-full p-3 rounded-md border-2 text-left',
        'transition-all active:scale-95',
        'hover:shadow-md hover:border-primary-300',
        status && STATUS_COLOR[status]
          ? `border-transparent ${STATUS_COLOR[status]}`
          : 'border-gray-200 bg-white'
      )}
    >
      {/* 호실 번호 */}
      <p className="text-sm font-bold leading-tight">{unit.name}</p>

      {/* 층 정보 */}
      {unit.floor != null && (
        <p className="text-xs opacity-70 mt-0.5">{unit.floor}층</p>
      )}

      {/* 입주 상태 배지 */}
      {status && (
        <div className="mt-1.5">
          <span className="text-xs font-medium">{status}</span>
        </div>
      )}

      {/* 데이터 입력 여부 표시 */}
      {record && !status && (
        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-400" />
      )}
    </button>
  )
}

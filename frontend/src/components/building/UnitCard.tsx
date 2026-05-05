import React from 'react'
import { cn, formatFloor } from '@/lib/utils'
import { useMyUnitRecord } from '@/queries/useRecordQueries'
import type { Unit } from '@/types'

interface UnitCardProps {
  unit: Unit
  /** 상태 표시용 필드 ID */
  statusFieldId?: string
  onClick: (unit: Unit) => void
}

const VALUE_COLOR: Record<string, string> = {
  입주: 'bg-green-100 text-green-700 border-green-200',
  입주중: 'bg-green-100 text-green-700 border-green-200',
  공실: 'bg-gray-100 text-gray-500 border-gray-200',
  공사중: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  수리중: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  계약완료: 'bg-blue-100 text-blue-700 border-blue-200',
  계약: 'bg-blue-100 text-blue-700 border-blue-200',
  퇴실: 'bg-red-100 text-red-600 border-red-200',
  퇴실예정: 'bg-red-100 text-red-600 border-red-200',
}

function hasNewComment(lastCommentAt?: string): boolean {
  if (!lastCommentAt) return false
  return Date.now() - new Date(lastCommentAt).getTime() < 24 * 60 * 60 * 1000
}

function extractStatusValue(data: Record<string, unknown>, fieldId: string): string | undefined {
  const val = data[fieldId]
  if (!val) return undefined
  if (Array.isArray(val)) return val[0] as string
  return val as string
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit, statusFieldId, onClick }) => {
  const { data: record } = useMyUnitRecord(unit.id)
  const isNew = hasNewComment(unit.lastCommentAt)
  const isActive = unit.isActive

  const statusValue = statusFieldId && record?.data
    ? extractStatusValue(record.data as Record<string, unknown>, statusFieldId)
    : undefined

  const colorClass = isActive
    ? 'bg-primary-500 text-white border-primary-500'
    : statusValue
      ? VALUE_COLOR[statusValue]
      : undefined

  return (
    <button
      onClick={() => onClick(unit)}
      className={cn(
        'relative w-full p-3 rounded-md border-2 text-left transition-all active:scale-95 hover:shadow-md',
        colorClass ?? 'border-gray-200 bg-white hover:border-primary-300'
      )}
    >
      {isNew && (
        <span className="absolute -top-1.5 -right-1.5 px-1 py-0 text-[9px] font-bold bg-red-500 text-white rounded shadow-sm leading-4">
          NEW
        </span>
      )}
      <p className={cn('text-sm font-bold leading-tight', isActive ? 'text-white' : 'text-gray-900')}>
        {unit.name.replace(/^(-?\d+)/, (_, n) => (parseInt(n) < 0 ? `B${Math.abs(parseInt(n))}` : n))}
      </p>
      {unit.floor != null && (
        <p className={cn('text-xs mt-0.5', isActive ? 'text-primary-100' : 'opacity-70')}>
          {formatFloor(unit.floor)}
        </p>
      )}
      {statusValue && !isActive && <p className="text-xs font-medium mt-1">{statusValue}</p>}
      {isActive && <div className="mt-1 w-1.5 h-1.5 rounded-full bg-white opacity-80" />}
      {record?.id && !statusValue && !isActive && (
        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-400" />
      )}
    </button>
  )
}

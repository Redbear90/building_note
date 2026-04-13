import React, { useState } from 'react'
import { Plus, Trash2, Settings } from 'lucide-react'
import { UnitCard } from './UnitCard'
import { UnitDetailModal } from './UnitDetailModal'
import { UnitGridSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { Building2 } from 'lucide-react'
import { useUnits, useCreateUnit, useDeleteUnit } from '@/queries/useUnitQueries'
import { useAuthStore } from '@/stores/authStore'
import type { Building, Unit } from '@/types'
import { cn } from '@/lib/utils'

interface UnitGridProps {
  building: Building
}

export const UnitGrid: React.FC<UnitGridProps> = ({ building }) => {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [unitForm, setUnitForm] = useState({ name: '', floor: '' })

  const { data: units = [], isLoading } = useUnits(building.id)
  const createUnit = useCreateUnit()
  const deleteUnit = useDeleteUnit()
  const isAdmin = useAuthStore((s) => s.isAdmin)

  const handleAddUnit = async () => {
    if (!unitForm.name.trim()) return
    await createUnit.mutateAsync({
      buildingId: building.id,
      name: unitForm.name,
      floor: unitForm.floor ? parseInt(unitForm.floor) : undefined,
      sortOrder: units.length,
    })
    setUnitForm({ name: '', floor: '' })
    setShowAddForm(false)
  }

  if (isLoading) return <UnitGridSkeleton />

  if (units.length === 0 && !isAdmin) {
    return (
      <EmptyState
        icon={Building2}
        title="등록된 호실이 없습니다"
        description="관리자에게 호실 추가를 요청하세요."
      />
    )
  }

  return (
    <>
      {/* 관리자 툴바 */}
      {isAdmin && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
          <span className="text-xs text-gray-500">호실 {units.length}개</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setIsEditing((v) => !v); setShowAddForm(false) }}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border transition-colors',
                isEditing
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400 hover:text-primary-600'
              )}
            >
              <Settings className="w-3 h-3" />
              {isEditing ? '완료' : '수정'}
            </button>
            {isEditing && (
              <button
                onClick={() => setShowAddForm((v) => !v)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border bg-white text-gray-600 border-gray-300 hover:border-primary-400 hover:text-primary-600 transition-colors"
              >
                <Plus className="w-3 h-3" />
                추가
              </button>
            )}
          </div>
        </div>
      )}

      {/* 호실 추가 폼 */}
      {isEditing && showAddForm && (
        <div className="px-4 py-3 border-b bg-white space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="호실명 (예: 101호) *"
              value={unitForm.name}
              onChange={(e) => setUnitForm((p) => ({ ...p, name: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUnit()}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded outline-none focus:ring-1 focus:ring-primary-500"
            />
            <input
              type="number"
              placeholder="층"
              value={unitForm.floor}
              onChange={(e) => setUnitForm((p) => ({ ...p, floor: e.target.value }))}
              className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              onClick={handleAddUnit}
              disabled={createUnit.isPending || !unitForm.name.trim()}
              className="px-3 py-1.5 text-xs font-medium bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
            >
              추가
            </button>
          </div>
        </div>
      )}

      {/* 호실 그리드 */}
      {units.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="등록된 호실이 없습니다"
          description={isAdmin ? '수정 → 추가 버튼으로 호실을 등록하세요.' : '관리자에게 호실 추가를 요청하세요.'}
        />
      ) : (
        <div className="grid grid-cols-3 gap-2 p-4">
          {units.map((unit) => (
            <div key={unit.id} className="relative">
              <UnitCard
                unit={unit}
                onClick={isEditing ? () => {} : setSelectedUnit}
              />
              {/* 삭제 버튼 (편집 모드) */}
              {isEditing && (
                <button
                  onClick={() => {
                    if (confirm(`"${unit.name}" 호실을 삭제하시겠습니까?`)) {
                      deleteUnit.mutate({ unitId: unit.id, buildingId: building.id })
                    }
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-sm"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedUnit && (
        <UnitDetailModal
          unit={selectedUnit}
          building={building}
          onClose={() => setSelectedUnit(null)}
        />
      )}
    </>
  )
}

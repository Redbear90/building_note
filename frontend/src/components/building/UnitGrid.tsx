import React, { useState } from 'react'
import { formatFloor } from '@/lib/utils'
import { Plus, Trash2, Settings, Wand2 } from 'lucide-react'
import { UnitCard } from './UnitCard'
import { UnitDetailModal } from './UnitDetailModal'
import { BulkUnitCreateModal } from './BulkUnitCreateModal'
import { UnitGridSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { Building2 } from 'lucide-react'
import { useUnits, useCreateUnit, useDeleteUnit } from '@/queries/useUnitQueries'
import { useFormSchema } from '@/queries/useFormSchemaQueries'
import { useAuthStore } from '@/stores/authStore'
import type { Building, Unit } from '@/types'
import { cn } from '@/lib/utils'

interface UnitGridProps {
  building: Building
}

/** 층별로 그룹핑 — 높은 층이 위에 오도록 내림차순 */
function groupByFloor(units: Unit[]): { floor: number | null; units: Unit[] }[] {
  const map = new Map<number | null, Unit[]>()

  for (const unit of units) {
    const floor = unit.floor ?? null
    if (!map.has(floor)) map.set(floor, [])
    map.get(floor)!.push(unit)
  }

  // 층 내 sortOrder 정렬
  for (const group of map.values()) {
    group.sort((a, b) => a.sortOrder - b.sortOrder)
  }

  // 낮은 층 → 높은 층 → null(층 없음) 순
  return [...map.entries()]
    .sort(([a], [b]) => {
      if (a === null) return 1
      if (b === null) return -1
      return a - b
    })
    .map(([floor, units]) => ({ floor, units }))
}

export const UnitGrid: React.FC<UnitGridProps> = ({ building }) => {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [unitForm, setUnitForm] = useState({ name: '', floor: '' })

  const { data: units = [], isLoading } = useUnits(building.id)
  const { data: schema } = useFormSchema(building.id)
  const createUnit = useCreateUnit()
  const deleteUnit = useDeleteUnit()
  const isAdmin = useAuthStore((s) => s.isAdmin)

  // 관리자가 "상태 필드"로 지정한 필드 ID
  const statusFieldId = schema?.fields.find((f) => f.isStatusField)?.id

  const floorGroups = groupByFloor(units)

  const handleAddUnit = async () => {
    if (!unitForm.name.trim()) return
    const floorNum = unitForm.floor ? parseInt(unitForm.floor) : undefined
    if (floorNum === 0) {
      alert('0층은 입력할 수 없습니다.')
      return
    }
    await createUnit.mutateAsync({
      buildingId: building.id,
      name: unitForm.name,
      floor: floorNum,
      sortOrder: units.length,
    })
    setUnitForm({ name: '', floor: '' })
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
          <span className="text-xs text-gray-500">총 {units.length}개 호실</span>
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
              <>
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border transition-colors bg-white text-gray-600 border-gray-300 hover:border-primary-400 hover:text-primary-600"
                >
                  <Wand2 className="w-3 h-3" />
                  일괄 생성
                </button>
                <button
                  onClick={() => setShowAddForm((v) => !v)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border transition-colors',
                    showAddForm
                      ? 'bg-gray-100 text-gray-700 border-gray-300'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400 hover:text-primary-600'
                  )}
                >
                  <Plus className="w-3 h-3" />
                  개별 추가
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 호실 추가 폼 */}
      {isEditing && showAddForm && (
        <div className="px-4 py-3 border-b bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="호실명 *"
              value={unitForm.name}
              onChange={(e) => setUnitForm((p) => ({ ...p, name: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUnit()}
              autoFocus
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded outline-none focus:ring-1 focus:ring-primary-500"
            />
            <input
              type="number"
              placeholder="층"
              value={unitForm.floor}
              onChange={(e) => setUnitForm((p) => ({ ...p, floor: e.target.value }))}
              className="w-14 px-2 py-1.5 text-sm border border-gray-300 rounded outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              onClick={handleAddUnit}
              disabled={createUnit.isPending || !unitForm.name.trim()}
              className="px-3 py-1.5 text-xs font-medium bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              추가
            </button>
          </div>
        </div>
      )}

      {/* 층별 호실 목록 */}
      {units.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="등록된 호실이 없습니다"
          description={isAdmin ? '수정 → 호실 추가로 등록하세요.' : '관리자에게 호실 추가를 요청하세요.'}
        />
      ) : (
        <div className="divide-y">
          {floorGroups.map(({ floor, units: floorUnits }) => (
            <div key={floor ?? 'null'}>
              {/* 층 헤더 */}
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 sticky top-0 z-10">
                <div className="flex items-center justify-center w-8 h-8 bg-primary-500 text-white text-sm font-bold rounded">
                  {floor != null ? (floor < 0 ? `B${Math.abs(floor)}` : floor) : '-'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {floor != null ? formatFloor(floor) : '층 미지정'}
                  </p>
                  <p className="text-xs text-gray-400">{floorUnits.length}개 호실</p>
                </div>
              </div>

              {/* 해당 층 호실 가로 나열 */}
              <div className="flex flex-wrap gap-2 px-4 py-3">
                {floorUnits.map((unit) => (
                  <div key={unit.id} className="relative w-[calc(33.333%-6px)]">
                    <UnitCard
                      unit={unit}
                      statusFieldId={statusFieldId}
                      onClick={isEditing ? () => {} : setSelectedUnit}
                    />
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

      {showBulkModal && (
        <BulkUnitCreateModal
          buildingId={building.id}
          currentUnitCount={units.length}
          onClose={() => setShowBulkModal(false)}
        />
      )}
    </>
  )
}

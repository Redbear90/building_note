import React from 'react'
import { Modal } from '@/components/common/Modal'
import { DynamicForm } from '@/components/form/DynamicForm'
import { Skeleton } from '@/components/common/Skeleton'
import { UnitCommentSection } from './UnitCommentSection'
import { useDynamicForm } from '@/hooks/useDynamicForm'
import { useFormSchema } from '@/queries/useFormSchemaQueries'
import { useMyUnitRecord } from '@/queries/useRecordQueries'
import { useSetUnitActive } from '@/queries/useUnitQueries'
import { formatFloor } from '@/lib/utils'
import type { Building, Unit } from '@/types'

interface UnitDetailModalProps {
  unit: Unit
  building: Building
  onClose: () => void
}

export const UnitDetailModal: React.FC<UnitDetailModalProps> = ({ unit, building, onClose }) => {
  const { data: schema, isLoading: schemaLoading } = useFormSchema(building.id)
  const { data: record, isLoading: recordLoading } = useMyUnitRecord(unit.id)
  const setActive = useSetUnitActive()

  const fields = schema?.fields ?? []
  const { form, handleSave, isSaving } = useDynamicForm({
    unitId: unit.id,
    fields,
    record,
    autoSaveDelay: 2000,
  })

  const isLoading = schemaLoading || recordLoading
  const isActive = unit.isActive

  const handleToggleActive = () => {
    setActive.mutate({ unitId: unit.id, buildingId: building.id, active: !isActive })
  }

  return (
    <Modal isOpen onClose={onClose} title={`${building.name} - ${unit.name}`} size="lg">
      <div
        className={`flex items-center justify-between px-5 py-3 border-b transition-colors ${
          isActive ? 'bg-primary-50' : 'bg-gray-50'
        }`}
      >
        <div>
          <p className="text-sm font-semibold text-gray-800">호실 표시</p>
          <p className="text-xs text-gray-400">켜면 목록에서 강조 표시됩니다</p>
        </div>
        <button
          onClick={handleToggleActive}
          disabled={setActive.isPending}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40 ${
            isActive ? 'bg-primary-500' : 'bg-gray-300'
          }`}
          aria-label="호실 활성 토글"
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
              isActive ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {unit.floor != null && <p className="text-sm text-gray-500">{formatFloor(unit.floor)}</p>}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <DynamicForm
            fields={fields}
            form={form}
            onSave={handleSave}
            isSaving={isSaving}
            autoSave
          />
        )}
      </div>

      <UnitCommentSection unitId={unit.id} />
    </Modal>
  )
}

import React from 'react'
import { Modal } from '@/components/common/Modal'
import { DynamicForm } from '@/components/form/DynamicForm'
import { Skeleton } from '@/components/common/Skeleton'
import { useDynamicForm } from '@/hooks/useDynamicForm'
import { useFormSchema } from '@/queries/useFormSchemaQueries'
import { useUnitRecord } from '@/queries/useRecordQueries'
import { useAuthStore } from '@/stores/authStore'
import { Lock } from 'lucide-react'
import type { Building, Unit } from '@/types'

interface UnitDetailModalProps {
  unit: Unit
  building: Building
  onClose: () => void
}

/**
 * 호실 상세 모달
 * - 폼 스키마 기반 동적 폼 렌더링
 * - 2초 자동저장
 * - 비인증 사용자는 조회만 가능
 */
export const UnitDetailModal: React.FC<UnitDetailModalProps> = ({
  unit,
  building,
  onClose,
}) => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAuthenticated = !!accessToken
  const { data: schema, isLoading: schemaLoading } = useFormSchema(building.id)
  const { data: record, isLoading: recordLoading } = useUnitRecord(unit.id)

  const fields = schema?.fields ?? []

  const { form, handleSave, isSaving } = useDynamicForm({
    unitId: unit.id,
    fields,
    record,
    autoSaveDelay: 2000,
  })

  const isLoading = schemaLoading || recordLoading

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`${building.name} - ${unit.name}`}
      size="lg"
    >
      <div className="px-5 py-4 space-y-4">
        {/* 층 정보 */}
        {unit.floor != null && (
          <p className="text-sm text-gray-500">{unit.floor}층</p>
        )}

        {/* 비인증 안내 */}
        {!isAuthenticated && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              로그인하면 데이터를 입력하고 저장할 수 있습니다.
            </p>
          </div>
        )}

        {/* 로딩 중 */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <fieldset disabled={!isAuthenticated}>
            <DynamicForm
              fields={fields}
              form={form}
              onSave={handleSave}
              isSaving={isSaving}
              autoSave={isAuthenticated}
            />
          </fieldset>
        )}
      </div>
    </Modal>
  )
}

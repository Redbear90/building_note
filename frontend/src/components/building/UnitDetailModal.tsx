import React from 'react'
import { Modal } from '@/components/common/Modal'
import { DynamicForm } from '@/components/form/DynamicForm'
import { Skeleton } from '@/components/common/Skeleton'
import { UnitCommentSection } from './UnitCommentSection'
import { useDynamicForm } from '@/hooks/useDynamicForm'
import { useFormSchema } from '@/queries/useFormSchemaQueries'
import { useUnitRecord, useSaveRecord } from '@/queries/useRecordQueries'
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
  const saveRecord = useSaveRecord()

  const fields = schema?.fields ?? []

  const { form, handleSave, isSaving } = useDynamicForm({
    unitId: unit.id,
    fields,
    record,
    autoSaveDelay: 2000,
  })

  const isLoading = schemaLoading || recordLoading

  // 활성 토글 상태
  const isActive = record?.data?.['__active'] === 'true'

  const handleToggleActive = async () => {
    // if (!isAuthenticated) return // [임시 공개] 복구 시 주석 해제
    const currentData = (record?.data ?? {}) as Record<string, string | string[]>
    await saveRecord.mutateAsync({
      unitId: unit.id,
      data: { ...currentData, __active: isActive ? 'false' : 'true' },
    })
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`${building.name} - ${unit.name}`}
      size="lg"
    >
      {/* 활성 토글 바 */}
      <div className={`flex items-center justify-between px-5 py-3 border-b transition-colors ${isActive ? 'bg-primary-50' : 'bg-gray-50'}`}>
        <div>
          <p className="text-sm font-semibold text-gray-800">호실 표시</p>
          <p className="text-xs text-gray-400">켜면 목록에서 강조 표시됩니다</p>
        </div>
        <button
          onClick={handleToggleActive}
          disabled={/* !isAuthenticated || */ saveRecord.isPending} /* [임시 공개] 복구 시 !isAuthenticated || 주석 해제 */
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
        {/* 층 정보 */}
        {unit.floor != null && (
          <p className="text-sm text-gray-500">{unit.floor}층</p>
        )}

        {/* 비인증 안내 */}
        {/* [임시 공개] 복구 시 주석 해제
        {!isAuthenticated && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              로그인하면 데이터를 입력하고 저장할 수 있습니다.
            </p>
          </div>
        )}
        */}

        {/* 로딩 중 */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <fieldset disabled={false}> {/* [임시 공개] 복구 시 disabled={!isAuthenticated} */}
            <DynamicForm
              fields={fields}
              form={form}
              onSave={handleSave}
              isSaving={isSaving}
              autoSave={true} /* [임시 공개] 복구 시 autoSave={isAuthenticated} */
            />
          </fieldset>
        )}
      </div>

      {/* 메모/댓글 섹션 */}
      <UnitCommentSection unitId={unit.id} />
    </Modal>
  )
}

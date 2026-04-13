import { useCallback, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import type { FormField, UnitRecord } from '@/types'
import { useSaveRecord } from '@/queries/useRecordQueries'

interface UseDynamicFormOptions {
  unitId: string
  fields: FormField[]
  record?: UnitRecord | null
  autoSaveDelay?: number  // ms, 기본 2000
}

/** 동적 폼 훅 - 자동저장 기능 포함 */
export const useDynamicForm = ({
  unitId,
  fields,
  record,
  autoSaveDelay = 2000,
}: UseDynamicFormOptions) => {
  const saveRecord = useSaveRecord()
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 기본값: record.data 또는 빈 객체
  const defaultValues = record?.data ?? {}

  const form = useForm<Record<string, string | string[]>>({
    defaultValues,
  })

  // record가 로드되면 폼 값 리셋
  useEffect(() => {
    if (record?.data) {
      form.reset(record.data)
    }
  }, [record, form])

  /** 수동 저장 */
  const handleSave = useCallback(
    async (data: Record<string, string | string[]>) => {
      await saveRecord.mutateAsync({ unitId, data })
    },
    [unitId, saveRecord]
  )

  /** 자동저장 (디바운스) */
  const scheduleAutoSave = useCallback(
    (data: Record<string, string | string[]>) => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
      autoSaveTimer.current = setTimeout(() => {
        saveRecord.mutate({ unitId, data })
      }, autoSaveDelay)
    },
    [unitId, saveRecord, autoSaveDelay]
  )

  // 폼 값 변경 시 자동저장 스케줄 (isDirty일 때만 — 초기 reset은 무시)
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (!form.formState.isDirty) return
      scheduleAutoSave(data as Record<string, string | string[]>)
    })
    return () => {
      subscription.unsubscribe()
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [form, scheduleAutoSave])

  /** 필드 초기값 생성 */
  const getDefaultValue = useCallback(
    (field: FormField): string | string[] => {
      if (field.type === 'checkbox') return []
      return ''
    },
    []
  )

  return {
    form,
    handleSave: form.handleSubmit(handleSave),
    isSaving: saveRecord.isPending,
    fields,
    getDefaultValue,
  }
}

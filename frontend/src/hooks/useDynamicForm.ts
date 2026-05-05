import { useCallback, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import type { FormField, UnitRecord } from '@/types'
import { useSaveMyRecord } from '@/queries/useRecordQueries'

interface UseDynamicFormOptions {
  unitId: string
  fields: FormField[]
  record?: UnitRecord | null
  autoSaveDelay?: number
  enabled?: boolean
}

/** 동적 폼 훅 — 본인 record를 자동저장한다. */
export const useDynamicForm = ({
  unitId,
  fields,
  record,
  autoSaveDelay = 2000,
  enabled = true,
}: UseDynamicFormOptions) => {
  const saveRecord = useSaveMyRecord()
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const defaultValues = record?.data ?? {}
  const form = useForm<Record<string, string | string[]>>({ defaultValues })

  useEffect(() => {
    if (record?.data) form.reset(record.data)
  }, [record, form])

  const handleSave = useCallback(
    async (data: Record<string, string | string[]>) => {
      if (!enabled) return
      await saveRecord.mutateAsync({ unitId, data })
    },
    [unitId, saveRecord, enabled]
  )

  const scheduleAutoSave = useCallback(
    (data: Record<string, string | string[]>) => {
      if (!enabled) return
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(() => {
        saveRecord.mutate({ unitId, data })
      }, autoSaveDelay)
    },
    [unitId, saveRecord, autoSaveDelay, enabled]
  )

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

  const getDefaultValue = useCallback((field: FormField): string | string[] => {
    if (field.type === 'checkbox') return []
    return ''
  }, [fields])

  return {
    form,
    handleSave: form.handleSubmit(handleSave),
    isSaving: saveRecord.isPending,
    fields,
    getDefaultValue,
  }
}

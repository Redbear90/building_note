import React from 'react'
import { Save, Loader2 } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import type { FormField } from '@/types'
import { TextField } from './fields/TextField'
import { TextareaField } from './fields/TextareaField'
import { CheckboxField } from './fields/CheckboxField'
import { RadioField } from './fields/RadioField'
import { SelectField } from './fields/SelectField'
import { DateField } from './fields/DateField'

interface DynamicFormProps {
  fields: FormField[]
  form: UseFormReturn<Record<string, string | string[]>>
  onSave: () => void
  isSaving?: boolean
  /** 자동저장 사용 여부 (true면 저장 버튼 표시 안함) */
  autoSave?: boolean
}

/**
 * 동적 폼 렌더러
 * FormSchema의 fields 배열을 순회하여 필드 타입에 맞는 컴포넌트를 렌더링
 */
export const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  form,
  onSave,
  isSaving = false,
  autoSave = true,
}) => {
  const {
    register,
    formState: { errors },
  } = form

  // sortOrder 기준 오름차순 정렬
  const sortedFields = [...fields].sort((a, b) => a.sortOrder - b.sortOrder)

  const renderField = (field: FormField) => {
    const error = errors[field.id]?.message as string | undefined
    const commonProps = {
      id: field.id,
      label: field.label,
      required: field.required,
      register,
      error,
    }

    switch (field.type) {
      case 'text':
      case 'number':
        return <TextField key={field.id} {...commonProps} />

      case 'textarea':
        return <TextareaField key={field.id} {...commonProps} />

      case 'checkbox':
        return (
          <CheckboxField
            key={field.id}
            {...commonProps}
            options={field.options ?? []}
          />
        )

      case 'radio':
        return (
          <RadioField
            key={field.id}
            {...commonProps}
            options={field.options ?? []}
          />
        )

      case 'select':
        return (
          <SelectField
            key={field.id}
            {...commonProps}
            options={field.options ?? []}
          />
        )

      case 'date':
        return <DateField key={field.id} {...commonProps} />

      default:
        return null
    }
  }

  if (sortedFields.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        설정된 폼 필드가 없습니다.
      </div>
    )
  }

  return (
    <form onSubmit={onSave} className="space-y-5">
      {sortedFields.map(renderField)}

      {/* 수동 저장 버튼 (자동저장이 아닐 때) */}
      {!autoSave && (
        <button
          type="submit"
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 disabled:opacity-60 transition-colors"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              저장
            </>
          )}
        </button>
      )}

      {/* 자동저장 인디케이터 */}
      {autoSave && isSaving && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <Loader2 className="w-3 h-3 animate-spin" />
          자동 저장 중...
        </div>
      )}
    </form>
  )
}

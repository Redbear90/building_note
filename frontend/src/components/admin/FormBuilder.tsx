import React, { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Plus,
  Trash2,
  X,
  Save,
  Loader2,
  Pencil,
  ChevronLeft,
} from 'lucide-react'
import type { FieldType, FormField } from '@/types'
import { useFormSchema, useSaveFormSchema } from '@/queries/useFormSchemaQueries'
import { cn } from '@/lib/utils'

interface FormBuilderProps {
  buildingId: string
  buildingName: string
  onClose: () => void
}

const FIELD_TYPES: { type: FieldType; label: string; description: string }[] = [
  { type: 'text', label: '텍스트', description: '한 줄 텍스트 입력' },
  { type: 'textarea', label: '장문 텍스트', description: '여러 줄 메모' },
  { type: 'radio', label: '단일 선택', description: '라디오 버튼' },
  { type: 'checkbox', label: '다중 선택', description: '체크박스' },
  { type: 'select', label: '드롭다운', description: '선택 목록' },
  { type: 'date', label: '날짜', description: '날짜 선택기' },
  { type: 'number', label: '숫자', description: '숫자 입력' },
]

const FIELD_TYPE_LABEL: Record<FieldType, string> = Object.fromEntries(
  FIELD_TYPES.map(({ type, label }) => [type, label])
) as Record<FieldType, string>

/** 정렬 가능한 필드 아이템 */
const SortableFieldItem: React.FC<{
  field: FormField
  onUpdate: (id: string, updates: Partial<FormField>) => void
  onDelete: (id: string) => void
}> = ({ field, onUpdate, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const needsOptions = ['radio', 'checkbox', 'select'].includes(field.type)
  const canBeStatusField = ['radio', 'checkbox', 'select'].includes(field.type)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white border rounded-md p-4 space-y-3',
        isDragging ? 'shadow-xl border-primary-300' : 'border-gray-200',
        field.isStatusField ? 'border-primary-400 bg-primary-50/30' : ''
      )}
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="px-2 py-0.5 text-xs font-medium bg-primary-50 text-primary-600 rounded-full">
          {FIELD_TYPE_LABEL[field.type] ?? field.type}
        </span>
        <div className="flex-1" />
        {canBeStatusField && (
          <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer" title="이 필드의 값으로 호실 카드 색상 표시">
            <input
              type="checkbox"
              checked={field.isStatusField ?? false}
              onChange={(e) => onUpdate(field.id, { isStatusField: e.target.checked })}
              className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            카드색상
          </label>
        )}
        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={field.required ?? false}
            onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          필수
        </label>
        <button
          onClick={() => onDelete(field.id)}
          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <input
        type="text"
        value={field.label}
        onChange={(e) => onUpdate(field.id, { label: e.target.value })}
        placeholder="필드 레이블"
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      />

      {needsOptions && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">선택지</p>
          {(field.options ?? []).map((option, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...(field.options ?? [])]
                  newOptions[idx] = e.target.value
                  onUpdate(field.id, { options: newOptions })
                }}
                placeholder={`선택지 ${idx + 1}`}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => {
                  const newOptions = (field.options ?? []).filter((_, i) => i !== idx)
                  onUpdate(field.id, { options: newOptions })
                }}
                className="p-1.5 text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newOptions = [...(field.options ?? []), '']
              onUpdate(field.id, { options: newOptions })
            }}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
          >
            <Plus className="w-3.5 h-3.5" />
            선택지 추가
          </button>
        </div>
      )}
    </div>
  )
}

/** 읽기 모드: 저장된 폼 스키마 미리보기 */
const FormSchemaViewer: React.FC<{
  fields: FormField[]
  buildingName: string
  onEdit: () => void
  onClose: () => void
}> = ({ fields, buildingName, onEdit, onClose }) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">{buildingName}</h3>
          <p className="text-xs text-gray-500">폼 스키마</p>
        </div>
      </div>
      <button
        onClick={onEdit}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-primary-400 text-primary-600 text-sm font-medium rounded-lg hover:bg-primary-50 transition-colors flex-shrink-0"
      >
        <Pencil className="w-3.5 h-3.5" />
        수정
      </button>
    </div>

    {fields.length === 0 ? (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-md">
        <p className="text-sm text-gray-400">등록된 폼 필드가 없습니다</p>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600"
        >
          <Plus className="w-3.5 h-3.5" />
          필드 추가
        </button>
      </div>
    ) : (
      <div className="flex-1 overflow-y-auto space-y-2">
        {fields.map((field, i) => (
          <div
            key={field.id}
            className={cn(
              'px-3 py-2.5 border rounded-md',
              field.isStatusField
                ? 'bg-primary-50 border-primary-300'
                : 'bg-white border-gray-200'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-5 text-right flex-shrink-0">{i + 1}.</span>
              <span className="text-sm font-medium text-gray-800 flex-1 truncate">{field.label}</span>
              {field.isStatusField && (
                <span className="text-[10px] font-semibold text-primary-600 bg-primary-100 px-1.5 py-0.5 rounded flex-shrink-0">
                  카드색상
                </span>
              )}
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
                {FIELD_TYPE_LABEL[field.type]}
              </span>
              {field.required && (
                <span className="text-xs text-red-400 flex-shrink-0">필수</span>
              )}
            </div>
            {field.options && field.options.length > 0 && (
              <p className="text-xs text-gray-400 mt-1 ml-7 truncate">
                {field.options.join(' / ')}
              </p>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)

/**
 * 폼 빌더 컴포넌트
 * - 저장된 스키마 자동 로드
 * - 읽기 모드 → 수정 버튼으로 편집 모드 전환
 */
const FormBuilder: React.FC<FormBuilderProps> = ({ buildingId, buildingName, onClose }) => {
  const { data: schema, isLoading } = useFormSchema(buildingId)
  const [isEditing, setIsEditing] = useState(false)
  const [fields, setFields] = useState<FormField[]>([])
  const saveSchema = useSaveFormSchema()

  // 스키마 로드 시 필드 초기화
  useEffect(() => {
    if (schema?.fields) {
      setFields(schema.fields)
    }
  }, [schema])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: `f_${Date.now()}`,
      type,
      label: FIELD_TYPE_LABEL[type] ?? type,
      options: ['radio', 'checkbox', 'select'].includes(type) ? ['옵션1', '옵션2'] : undefined,
      required: false,
      sortOrder: fields.length,
    }
    setFields((prev) => [...prev, newField])
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields((prev) => prev.map((f) => {
      if (f.id === id) return { ...f, ...updates }
      // isStatusField를 true로 설정하면 다른 필드는 false로 해제
      if (updates.isStatusField === true) return { ...f, isStatusField: false }
      return f
    }))
  }

  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setFields((prev) => {
      const oldIdx = prev.findIndex((f) => f.id === active.id)
      const newIdx = prev.findIndex((f) => f.id === over.id)
      return arrayMove(prev, oldIdx, newIdx).map((f, i) => ({ ...f, sortOrder: i }))
    })
  }

  const handleSave = async () => {
    const normalizedFields = fields.map((f, i) => ({ ...f, sortOrder: i }))
    await saveSchema.mutateAsync({ buildingId, schema: { fields: normalizedFields } })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    // 편집 취소 시 원래 스키마로 복원
    setFields(schema?.fields ?? [])
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
      </div>
    )
  }

  // 읽기 모드
  if (!isEditing) {
    return (
      <FormSchemaViewer
        fields={fields}
        buildingName={buildingName}
        onEdit={() => setIsEditing(true)}
        onClose={onClose}
      />
    )
  }

  // 편집 모드
  return (
    <div className="flex h-full gap-4">
      {/* 좌측: 현재 스키마 편집 */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">{buildingName}</h3>
            <p className="text-xs text-gray-500">폼 스키마 편집 중</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saveSchema.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-60"
            >
              {saveSchema.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              저장
            </button>
          </div>
        </div>

        {fields.length === 0 ? (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-md">
            <p className="text-sm text-gray-400">우측에서 필드 타입을 선택하세요</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {fields.map((field) => (
                  <SortableFieldItem
                    key={field.id}
                    field={field}
                    onUpdate={updateField}
                    onDelete={deleteField}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* 우측: 필드 타입 팔레트 */}
      <div className="w-36 flex-shrink-0">
        <p className="text-xs font-medium text-gray-600 mb-3">필드 추가</p>
        <div className="space-y-2">
          {FIELD_TYPES.map(({ type, label, description }) => (
            <button
              key={type}
              onClick={() => addField(type)}
              className="w-full px-3 py-2.5 text-left bg-white border border-gray-200 rounded-md hover:border-primary-400 hover:bg-primary-50 transition-colors"
            >
              <p className="text-xs font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FormBuilder

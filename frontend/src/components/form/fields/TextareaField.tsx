import { UseFormRegister } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface TextareaFieldProps {
  id: string
  label: string
  required?: boolean
  register: UseFormRegister<Record<string, string | string[]>>
  error?: string
  rows?: number
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  id,
  label,
  required,
  register,
  error,
  rows = 4,
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      id={id}
      rows={rows}
      placeholder={`${label}을(를) 입력하세요`}
      {...register(id, { required: required ? `${label}은(는) 필수입니다.` : false })}
      className={cn(
        'w-full px-3 py-2 text-sm border rounded-lg outline-none resize-none',
        'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
        'transition-colors placeholder:text-gray-400',
        error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
      )}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

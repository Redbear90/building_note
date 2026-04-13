import { UseFormRegister } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface RadioFieldProps {
  id: string
  label: string
  options: string[]
  required?: boolean
  register: UseFormRegister<Record<string, string | string[]>>
  error?: string
}

export const RadioField: React.FC<RadioFieldProps> = ({
  id,
  label,
  options,
  required,
  register,
  error,
}) => (
  <div className="space-y-2">
    <p className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </p>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <label
          key={option}
          className="flex items-center gap-1.5 cursor-pointer"
        >
          <input
            type="radio"
            value={option}
            {...register(id, { required: required ? `${label}을(를) 선택해주세요.` : false })}
            className="w-4 h-4 border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <span className={cn('text-sm', error ? 'text-red-600' : 'text-gray-700')}>{option}</span>
        </label>
      ))}
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

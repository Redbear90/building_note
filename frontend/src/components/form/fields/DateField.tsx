import { UseFormRegister } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface DateFieldProps {
  id: string
  label: string
  required?: boolean
  register: UseFormRegister<Record<string, string | string[]>>
  error?: string
}

export const DateField: React.FC<DateFieldProps> = ({
  id,
  label,
  required,
  register,
  error,
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      id={id}
      type="date"
      {...register(id, { required: required ? `${label}을(를) 선택해주세요.` : false })}
      className={cn(
        'w-full px-3 py-2 text-sm border rounded-lg outline-none bg-white',
        'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
        'transition-colors',
        error ? 'border-red-400 bg-red-50' : 'border-gray-300'
      )}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

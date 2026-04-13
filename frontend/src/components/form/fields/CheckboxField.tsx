import { UseFormRegister } from 'react-hook-form'

interface CheckboxFieldProps {
  id: string
  label: string
  options: string[]
  required?: boolean
  register: UseFormRegister<Record<string, string | string[]>>
  error?: string
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
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
          className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700"
        >
          <input
            type="checkbox"
            value={option}
            {...register(id)}
            className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          {option}
        </label>
      ))}
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

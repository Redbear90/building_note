import React, { useState, useEffect } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { Building2, Loader2 } from 'lucide-react'
import { useAuth, homeForRole } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const SignupMemberPage: React.FC = () => {
  const { signupMember } = useAuth()
  const user = useAuthStore((s) => s.user)
  const [params] = useSearchParams()
  const [form, setForm] = useState({ inviteCode: '', name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const code = params.get('code')
    if (code) setForm((f) => ({ ...f, inviteCode: code.toUpperCase() }))
  }, [params])

  if (user) return <Navigate to={homeForRole(user.role)} replace />

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = k === 'inviteCode' ? e.target.value.toUpperCase() : e.target.value
    setForm({ ...form, [k]: v })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signupMember(form)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass = cn(
    'w-full px-4 py-3 text-sm border rounded-md outline-none border-gray-300',
    'focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors'
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-500 rounded-lg mb-3 shadow-lg">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">멤버로 합류하기</h1>
          <p className="text-xs text-gray-500 mt-1">관리자에게 받은 초대 코드로 워크스페이스에 들어갑니다.</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">초대 코드</label>
            <input className={cn(fieldClass, 'tracking-widest font-mono uppercase')}
              required maxLength={20} minLength={4}
              value={form.inviteCode} onChange={onChange('inviteCode')}
              placeholder="ABC23456" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">이름</label>
            <input className={fieldClass} required maxLength={100}
              value={form.name} onChange={onChange('name')} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <input type="email" className={fieldClass} required autoComplete="email"
              value={form.email} onChange={onChange('email')} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">비밀번호 (8자 이상)</label>
            <input type="password" className={fieldClass} required minLength={8} maxLength={100}
              autoComplete="new-password"
              value={form.password} onChange={onChange('password')} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={cn(
              'w-full py-3 text-sm font-semibold text-white rounded-md transition-colors',
              'bg-primary-500 hover:bg-primary-600',
              'disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            )}
          >
            {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />가입 중...</>) : '가입 완료'}
          </button>

          <p className="pt-3 border-t text-center text-xs text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-primary-600 hover:underline font-medium">로그인</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default SignupMemberPage

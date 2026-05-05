import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import { homeForRole } from '@/hooks/useAuth'
import { Navigate } from 'react-router-dom'

const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const user = useAuthStore((s) => s.user)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to={homeForRole(user.role)} replace />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-lg mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">BuildingNote</h1>
          <p className="text-sm text-gray-500 mt-1">로그인</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={cn(
                'w-full px-4 py-3 text-sm border rounded-md outline-none border-gray-300',
                'focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors'
              )}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={cn(
                  'w-full px-4 py-3 pr-12 text-sm border rounded-md outline-none border-gray-300',
                  'focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
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
            {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />로그인 중...</>) : '로그인'}
          </button>

          <div className="pt-3 border-t space-y-2 text-center">
            <p className="text-xs text-gray-500">
              아직 워크스페이스가 없으신가요?{' '}
              <Link to="/signup" className="text-primary-600 hover:underline font-medium">
                새 워크스페이스 만들기
              </Link>
            </p>
            <p className="text-xs text-gray-500">
              초대 코드를 받으셨나요?{' '}
              <Link to="/signup/join" className="text-primary-600 hover:underline font-medium">
                멤버로 합류하기
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage

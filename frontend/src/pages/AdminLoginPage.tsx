import React, { useState } from 'react'
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

/**
 * 관리자 로그인 페이지
 */
const AdminLoginPage: React.FC = () => {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-lg mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">BuildingNote</h1>
          <p className="text-sm text-gray-500 mt-1">관리자 로그인</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          {/* 에러 메시지 */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 이메일 */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              required
              autoComplete="email"
              className={cn(
                'w-full px-4 py-3 text-sm border rounded-md outline-none',
                'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                'transition-colors placeholder:text-gray-400',
                'border-gray-300'
              )}
            />
          </div>

          {/* 비밀번호 */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                required
                autoComplete="current-password"
                className={cn(
                  'w-full px-4 py-3 pr-12 text-sm border rounded-md outline-none',
                  'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                  'transition-colors placeholder:text-gray-400',
                  'border-gray-300'
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

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full py-3 text-sm font-semibold text-white rounded-md',
              'bg-primary-500 hover:bg-primary-600',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              'transition-colors flex items-center justify-center gap-2'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </button>

          {/* 테스트 계정 안내 */}
          <div className="pt-2 border-t text-center">
            <p className="text-xs text-gray-400">
              테스트 계정: admin@naver.com / admin1234
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminLoginPage

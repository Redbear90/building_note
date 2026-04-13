import React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  /** 모달 크기 */
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const SIZE_CLASS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

/**
 * 공통 모달 컴포넌트
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = 'md',
}) => {
  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* 모달 본체 */}
      <div
        className={cn(
          'relative z-10 w-full bg-white',
          'rounded-t-2xl sm:rounded-lg shadow-2xl',
          'max-h-[90vh] overflow-hidden',
          SIZE_CLASS[size],
          'animate-slide-up sm:animate-fade-in',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="overflow-y-auto max-h-[calc(90vh-60px)]">{children}</div>
      </div>
    </div>,
    document.body
  )
}

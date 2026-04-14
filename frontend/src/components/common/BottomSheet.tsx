import React, { useRef } from 'react'
import { cn } from '@/lib/utils'
import type { SnapPoint } from '@/types'

interface BottomSheetProps {
  snapPoint: SnapPoint
  onSnapChange: (point: SnapPoint) => void
  children: React.ReactNode
  className?: string
}

/** 스냅 포인트별 translateY 값 */
const SNAP_TRANSLATE: Record<SnapPoint, string> = {
  hidden: 'translateY(calc(100% - 44px))',  // 핸들+검색창 살짝 노출
  half: 'translateY(55%)',
  full: 'translateY(10%)',
}

/**
 * 모바일 바텀시트 컴포넌트
 * - 스냅 포인트: hidden(숨김) / half(45%) / full(90%)
 * - 터치 드래그로 스냅 포인트 이동
 * - cubic-bezier 스프링 애니메이션
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  snapPoint,
  onSnapChange,
  children,
  className,
}) => {
  const startY = useRef(0)
  const isDragging = useRef(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    isDragging.current = true
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // 풀 스냅일 때 내부 스크롤을 방해하지 않도록 처리
    if (snapPoint === 'full') return
    e.preventDefault()
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return
    isDragging.current = false

    const endY = e.changedTouches[0].clientY
    const delta = startY.current - endY

    // 30px 미만 드래그는 무시
    if (Math.abs(delta) < 30) return

    if (delta > 0) {
      // 위로 드래그
      if (snapPoint === 'hidden') onSnapChange('half')
      else if (snapPoint === 'half') onSnapChange('full')
    } else {
      // 아래로 드래그
      if (snapPoint === 'full') onSnapChange('half')
      else if (snapPoint === 'half') onSnapChange('hidden')
    }
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30',
        'bg-white rounded-t-2xl shadow-2xl',
        'will-change-transform',
        className
      )}
      style={{
        transform: SNAP_TRANSLATE[snapPoint],
        transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        height: '90vh',   // 최대 높이 (full 스냅 기준)
      }}
    >
      {/* 드래그 핸들 */}
      <div
        className="flex justify-center items-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
      </div>

      {/* 콘텐츠 영역 */}
      <div className="overflow-y-auto h-[calc(100%-40px)] pb-safe">
        {children}
      </div>
    </div>
  )
}

import { useCallback, useRef, useState } from 'react'
import type { SnapPoint } from '@/types'

/** 바텀시트 스냅 포인트별 높이 비율 */
const SNAP_POINTS: Record<SnapPoint, number> = {
  hidden: 0,
  half: 45,
  full: 90,
}

interface UseBottomSheetReturn {
  snapPoint: SnapPoint
  setSnapPoint: (point: SnapPoint) => void
  translateY: string
  dragHandleProps: {
    onTouchStart: (e: React.TouchEvent) => void
    onTouchMove: (e: React.TouchEvent) => void
    onTouchEnd: (e: React.TouchEvent) => void
  }
}

/** 바텀시트 터치 드래그 훅 */
export const useBottomSheet = (
  initial: SnapPoint = 'hidden',
  onSnapChange?: (point: SnapPoint) => void
): UseBottomSheetReturn => {
  const [snapPoint, setSnapPointState] = useState<SnapPoint>(initial)
  const startY = useRef(0)
  const isDragging = useRef(false)

  const setSnapPoint = useCallback(
    (point: SnapPoint) => {
      setSnapPointState(point)
      onSnapChange?.(point)
    },
    [onSnapChange]
  )

  const translateY = `${100 - SNAP_POINTS[snapPoint]}%`

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    isDragging.current = true
  }, [])

  const handleTouchMove = useCallback((_e: React.TouchEvent) => {
    // 드래그 중 스크롤 방지 (필요 시 preventDefault)
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current) return
      isDragging.current = false

      const endY = e.changedTouches[0].clientY
      const delta = startY.current - endY

      // 드래그 방향에 따라 스냅 포인트 결정
      if (Math.abs(delta) < 30) return  // 작은 움직임 무시

      if (delta > 0) {
        // 위로 드래그 → 다음 스냅 포인트로
        if (snapPoint === 'hidden') setSnapPoint('half')
        else if (snapPoint === 'half') setSnapPoint('full')
      } else {
        // 아래로 드래그 → 이전 스냅 포인트로
        if (snapPoint === 'full') setSnapPoint('half')
        else if (snapPoint === 'half') setSnapPoint('hidden')
      }
    },
    [snapPoint, setSnapPoint]
  )

  return {
    snapPoint,
    setSnapPoint,
    translateY,
    dragHandleProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}

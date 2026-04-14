import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Tailwind 클래스 병합 유틸리티 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 날짜 포맷 (YYYY-MM-DD → YYYY년 MM월 DD일) */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** 상대 시간 포맷 (방금 전, N분 전 등) */
export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  return formatDate(dateStr)
}

/** 숫자에 콤마 추가 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR')
}

/** 폴리곤 꼭짓점 배열의 중심 좌표 계산 */
export function polygonCenter(polygon: [number, number][]): { lat: number; lng: number } | null {
  if (!polygon.length) return null
  const lat = polygon.reduce((sum, [la]) => sum + la, 0) / polygon.length
  const lng = polygon.reduce((sum, [, lo]) => sum + lo, 0) / polygon.length
  return { lat, lng }
}

/** 층수 표시 (음수 → 지하N층, 양수 → N층) */
export function formatFloor(floor: number): string {
  return floor < 0 ? `지하${Math.abs(floor)}층` : `${floor}층`
}

/** 디바운스 함수 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

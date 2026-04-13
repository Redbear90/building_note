import React from 'react'
import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Building } from '@/types'

interface BuildingMarkerProps {
  building: Building
  isSelected?: boolean
  onClick: (building: Building) => void
}

/**
 * 건물 커스텀 마커 컴포넌트
 * Kakao Map CustomOverlay의 HTML 템플릿으로 사용
 * (실제 렌더링은 useKakaoMap 내부에서 innerHTML로 삽입)
 */
export const BuildingMarkerContent: React.FC<BuildingMarkerProps> = ({
  building,
  isSelected = false,
  onClick,
}) => (
  <div
    className={cn(
      'flex flex-col items-center cursor-pointer select-none',
      'transform transition-transform active:scale-95'
    )}
    onClick={() => onClick(building)}
  >
    {/* 마커 아이콘 */}
    <div
      className={cn(
        'w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2',
        'transition-colors',
        isSelected
          ? 'bg-primary-500 border-white text-white scale-110'
          : 'bg-white border-primary-500 text-primary-500'
      )}
    >
      <Building2 className="w-4 h-4" />
    </div>

    {/* 마커 레이블 */}
    <div
      className={cn(
        'mt-1 px-1.5 py-0.5 text-xs font-medium rounded shadow whitespace-nowrap',
        'max-w-[80px] truncate',
        isSelected ? 'bg-primary-500 text-white' : 'bg-white text-gray-800'
      )}
    >
      {building.name}
    </div>

    {/* 마커 꼬리 삼각형 */}
    <div
      className={cn(
        'w-0 h-0',
        'border-l-4 border-r-4 border-t-4',
        'border-l-transparent border-r-transparent',
        isSelected ? 'border-t-primary-500' : 'border-t-white'
      )}
      style={{ marginTop: -1 }}
    />
  </div>
)

/** Kakao CustomOverlay용 HTML 문자열 생성 */
export const getBuildingMarkerHTML = (building: Building): string => `
  <div
    class="building-marker flex flex-col items-center cursor-pointer"
    data-building-id="${building.id}"
    style="transform: translateY(-100%)"
  >
    <div class="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 bg-white border-[#01696f] text-[#01696f]">
      🏢
    </div>
    <div class="mt-1 px-1.5 py-0.5 text-xs font-medium bg-white text-gray-800 rounded shadow max-w-[80px] truncate">
      ${building.name}
    </div>
  </div>
`

export default BuildingMarkerContent

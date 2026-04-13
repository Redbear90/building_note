import React from 'react'
import type { Zone } from '@/types'

interface ZonePolygonProps {
  zone: Zone
  onClick?: (zone: Zone) => void
}

/**
 * 구역 폴리곤 컴포넌트
 * 실제 렌더링은 Kakao SDK가 담당
 * 이 컴포넌트는 Props 타입 정의 및 관리자 UI에서 구역 정보 표시용
 */
export const ZonePolygon: React.FC<ZonePolygonProps> = ({ zone }) => {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
    >
      {/* 색상 표시 */}
      <div
        className="w-4 h-4 rounded-sm border"
        style={{ backgroundColor: zone.color, borderColor: zone.color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{zone.name}</p>
        <p className="text-xs text-gray-500">{zone.polygon.length}개 꼭짓점</p>
      </div>
    </div>
  )
}

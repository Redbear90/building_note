import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

/** 로딩 스켈레톤 컴포넌트 */
export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn('animate-pulse rounded bg-gray-200', className)} />
)

/** 카드 형태 스켈레톤 */
export const CardSkeleton: React.FC = () => (
  <div className="p-4 space-y-3">
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-full" />
  </div>
)

/** 호실 그리드 스켈레톤 */
export const UnitGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-3 gap-2 p-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} className="h-16 rounded-md" />
    ))}
  </div>
)

/** 건물 목록 스켈레톤 */
export const BuildingListSkeleton: React.FC = () => (
  <div className="divide-y">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="px-4 py-3 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ))}
  </div>
)

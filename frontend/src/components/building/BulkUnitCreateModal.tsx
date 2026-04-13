import React, { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X, Wand2, Loader2 } from 'lucide-react'
import { useCreateUnit } from '@/queries/useUnitQueries'
import { cn } from '@/lib/utils'

interface BulkUnitCreateModalProps {
  buildingId: string
  currentUnitCount: number
  onClose: () => void
}

interface BulkConfig {
  floorStart: string   // 시작 층 (예: 1)
  floorEnd: string     // 끝 층 (예: 5)
  unitsPerFloor: string // 층당 호실 수 (예: 4)
  unitDigits: string   // 호수 자릿수 (예: 2 → 01, 02)
  prefix: string       // 호실명 접두사 (비워두면 "{층}{호수}" 형식)
  suffix: string       // 호실명 접미사 (예: "호" → 101호)
}

/** 설정으로부터 생성될 호실 목록 계산 */
function generateUnits(config: BulkConfig): { name: string; floor: number }[] {
  const floorStart = parseInt(config.floorStart)
  const floorEnd = parseInt(config.floorEnd)
  const unitsPerFloor = parseInt(config.unitsPerFloor)
  const unitDigits = parseInt(config.unitDigits) || 2

  if (
    isNaN(floorStart) || isNaN(floorEnd) || isNaN(unitsPerFloor) ||
    floorStart > floorEnd || unitsPerFloor < 1 || unitsPerFloor > 50
  ) return []

  const result: { name: string; floor: number }[] = []

  for (let floor = floorStart; floor <= floorEnd; floor++) {
    for (let unit = 1; unit <= unitsPerFloor; unit++) {
      const unitNum = String(unit).padStart(unitDigits, '0')
      const name = `${config.prefix}${floor}${unitNum}${config.suffix}`
      result.push({ name, floor })
    }
  }

  return result
}

export const BulkUnitCreateModal: React.FC<BulkUnitCreateModalProps> = ({
  buildingId,
  currentUnitCount,
  onClose,
}) => {
  const createUnit = useCreateUnit()
  const [isCreating, setIsCreating] = useState(false)
  const [config, setConfig] = useState<BulkConfig>({
    floorStart: '1',
    floorEnd: '5',
    unitsPerFloor: '4',
    unitDigits: '2',
    prefix: '',
    suffix: '호',
  })

  const set = (key: keyof BulkConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setConfig((p) => ({ ...p, [key]: e.target.value }))

  const preview = useMemo(() => generateUnits(config), [config])

  const handleCreate = async () => {
    if (preview.length === 0) return
    if (!confirm(`${preview.length}개 호실을 생성하시겠습니까?`)) return

    setIsCreating(true)
    try {
      // 순차 생성 (순서 보장)
      for (let i = 0; i < preview.length; i++) {
        const { name, floor } = preview[i]
        await createUnit.mutateAsync({
          buildingId,
          name,
          floor,
          sortOrder: currentUnitCount + i,
        })
      }
      onClose()
    } finally {
      setIsCreating(false)
    }
  }

  const floorStart = parseInt(config.floorStart)
  const floorEnd = parseInt(config.floorEnd)
  const floorCount = (!isNaN(floorStart) && !isNaN(floorEnd) && floorEnd >= floorStart)
    ? floorEnd - floorStart + 1
    : 0

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary-500" />
            <h2 className="text-base font-semibold text-gray-900">호실 일괄 생성</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* 층 범위 */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">층 범위</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={config.floorStart}
                onChange={set('floorStart')}
                min={-10}
                max={200}
                className="w-20 px-3 py-2 text-sm border border-gray-300 rounded outline-none focus:ring-2 focus:ring-primary-500 text-center"
              />
              <span className="text-sm text-gray-500">층 ~</span>
              <input
                type="number"
                value={config.floorEnd}
                onChange={set('floorEnd')}
                min={-10}
                max={200}
                className="w-20 px-3 py-2 text-sm border border-gray-300 rounded outline-none focus:ring-2 focus:ring-primary-500 text-center"
              />
              <span className="text-sm text-gray-500">층</span>
              {floorCount > 0 && (
                <span className="text-xs text-gray-400">({floorCount}개 층)</span>
              )}
            </div>
          </div>

          {/* 층당 호실 수 */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">층당 호실 수</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={config.unitsPerFloor}
                onChange={set('unitsPerFloor')}
                min={1}
                max={50}
                className="w-20 px-3 py-2 text-sm border border-gray-300 rounded outline-none focus:ring-2 focus:ring-primary-500 text-center"
              />
              <span className="text-sm text-gray-500">개</span>
            </div>
          </div>

          {/* 호실명 형식 */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">호실명 형식</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <input
                type="text"
                placeholder="접두사"
                value={config.prefix}
                onChange={set('prefix')}
                className="w-20 px-3 py-2 text-sm border border-gray-300 rounded outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-2 rounded font-mono">
                {config.floorStart || '1'}
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={config.unitDigits}
                  onChange={set('unitDigits')}
                  min={1}
                  max={3}
                  className="w-14 px-2 py-2 text-sm border border-gray-300 rounded outline-none focus:ring-2 focus:ring-primary-500 text-center"
                />
                <span className="text-xs text-gray-400">자리</span>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-2 rounded font-mono">
                {'1'.padStart(parseInt(config.unitDigits) || 2, '0')}
              </span>
              <input
                type="text"
                placeholder="접미사"
                value={config.suffix}
                onChange={set('suffix')}
                className="w-16 px-3 py-2 text-sm border border-gray-300 rounded outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              예시: <span className="font-mono text-gray-600">
                {generateUnits({ ...config, floorEnd: config.floorStart })[0]?.name ?? '-'}
              </span>
              {preview.length > 1 && (
                <>, <span className="font-mono text-gray-600">{preview[1]?.name}</span>, ...</>
              )}
            </p>
          </div>

          {/* 미리보기 */}
          {preview.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">
                미리보기 <span className="text-primary-600 font-bold">({preview.length}개)</span>
              </p>
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  {/* 층별로 그룹 표시 */}
                  {Array.from(new Set(preview.map((u) => u.floor))).map((floor) => {
                    const floorUnits = preview.filter((u) => u.floor === floor)
                    return (
                      <div key={floor} className="border-b last:border-b-0">
                        <div className="px-3 py-1.5 bg-gray-50 flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-600">{floor}층</span>
                          <span className="text-xs text-gray-400">{floorUnits.length}개</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 px-3 py-2">
                          {floorUnits.map((u) => (
                            <span
                              key={u.name}
                              className="px-2 py-0.5 text-xs bg-white border border-gray-200 rounded text-gray-700"
                            >
                              {u.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {preview.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">
              층 범위와 호실 수를 입력하면 미리보기가 표시됩니다.
            </p>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleCreate}
            disabled={preview.length === 0 || isCreating}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded transition-colors',
              preview.length > 0 && !isCreating
                ? 'bg-primary-500 hover:bg-primary-600'
                : 'bg-gray-300 cursor-not-allowed'
            )}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                {preview.length > 0 ? `${preview.length}개 생성` : '생성'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

import React, { useState } from 'react'
import { Trash2, Send, MessageSquare, Loader2 } from 'lucide-react'
import { useUnitComments, useAddComment, useDeleteComment } from '@/queries/useCommentQueries'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import type { UnitComment } from '@/types'

interface UnitCommentSectionProps {
  unitId: string
}

/** 24시간 이내 여부 */
function isWithin24h(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000
}

/** 상대 시각 표시 */
function timeAgo(createdAt: string): string {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`
  const diffDay = Math.floor(diffHour / 24)
  return `${diffDay}일 전`
}

const CommentItem: React.FC<{ comment: UnitComment; unitId: string; isAdmin: boolean }> = ({
  comment,
  unitId,
  isAdmin,
}) => {
  const deleteComment = useDeleteComment()
  const isNew = isWithin24h(comment.createdAt)

  return (
    <div className="flex gap-2 py-2.5 border-b last:border-b-0">
      {/* 아바타 */}
      <div className="w-7 h-7 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center">
        <span className="text-xs font-semibold text-primary-600">
          {comment.author.charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs font-semibold text-gray-800">{comment.author}</span>
          {isNew && (
            <span className="px-1 py-0 text-[10px] font-bold bg-red-500 text-white rounded">
              NEW
            </span>
          )}
          <span className="text-[11px] text-gray-400 ml-auto flex-shrink-0">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed break-words">{comment.content}</p>
      </div>

      {/* 관리자 삭제 버튼 */}
      {isAdmin && (
        <button
          onClick={() => {
            if (confirm('댓글을 삭제하시겠습니까?')) {
              deleteComment.mutate({ unitId, commentId: comment.id })
            }
          }}
          disabled={deleteComment.isPending}
          className="flex-shrink-0 p-1 text-gray-300 hover:text-red-400 transition-colors"
          aria-label="댓글 삭제"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

export const UnitCommentSection: React.FC<UnitCommentSectionProps> = ({ unitId }) => {
  const { data: comments = [], isLoading } = useUnitComments(unitId)
  const addComment = useAddComment()
  const accessToken = useAuthStore((s) => s.accessToken)
  // const isAuthenticated = !!accessToken // [임시 공개] 복구 시 주석 해제
  const isAuthenticated = true // [임시 공개] 복구 시 이 줄 제거
  const isAdmin = useAuthStore((s) => s.isAdmin)

  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = async () => {
    const trimAuthor = author.trim()
    const trimContent = content.trim()
    if (!trimAuthor || !trimContent) return

    await addComment.mutateAsync({ unitId, author: trimAuthor, content: trimContent })
    setContent('')
    // author는 유지 (연속 작성 편의)
  }

  return (
    <div className="border-t mt-1">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-1.5 px-5 py-3 border-b bg-gray-50">
        <MessageSquare className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">메모</span>
        {comments.length > 0 && (
          <span className="text-xs text-gray-400">({comments.length})</span>
        )}
      </div>

      {/* 댓글 목록 */}
      <div className={cn('px-5', comments.length > 4 ? 'max-h-48 overflow-y-auto' : '')}>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">아직 메모가 없습니다.</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              unitId={unitId}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>

      {/* 댓글 작성 폼 */}
      {isAuthenticated ? (
        <div className="px-5 py-3 bg-gray-50 border-t space-y-2">
          <input
            type="text"
            placeholder="작성자"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={50}
            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded outline-none focus:ring-1 focus:ring-primary-500"
          />
          <div className="flex gap-2">
            <textarea
              placeholder="메모 내용을 입력하세요... (최대 500자)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
              }}
              maxLength={500}
              rows={2}
              className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded resize-none outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              onClick={handleSubmit}
              disabled={addComment.isPending || !author.trim() || !content.trim()}
              className="px-3 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              {addComment.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-gray-400">Ctrl+Enter로 전송</p>
        </div>
      ) : (
        <div className="px-5 py-2.5 border-t bg-gray-50">
          <p className="text-xs text-gray-400 text-center">로그인하면 메모를 작성할 수 있습니다.</p>
        </div>
      )}
    </div>
  )
}

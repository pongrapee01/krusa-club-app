import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

type PaginationProps = {
  page: number
  totalPages: number
  totalItems: number
  onPageChange: (next: number) => void
  className?: string
}

export function Pagination({ page, totalPages, totalItems, onPageChange, className }: PaginationProps) {
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div
      className={cn(
        'flex flex-col items-stretch justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5 sm:flex-row sm:items-center',
        className,
      )}
    >
      <p className="text-xs text-white/65 sm:text-sm">
        แสดงหน้า {page} จาก {totalPages} · ทั้งหมด {totalItems} รายการ
      </p>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          className={cn(
            'inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg ring-1 transition',
            canPrev
              ? 'text-white ring-white/20 hover:bg-white/10'
              : 'cursor-not-allowed text-white/35 ring-white/10',
          )}
          aria-label="หน้าก่อนหน้า"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          className={cn(
            'inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg ring-1 transition',
            canNext
              ? 'text-white ring-white/20 hover:bg-white/10'
              : 'cursor-not-allowed text-white/35 ring-white/10',
          )}
          aria-label="หน้าถัดไป"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  )
}

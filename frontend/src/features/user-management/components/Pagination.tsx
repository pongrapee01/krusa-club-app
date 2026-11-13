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

  const btnClass = (enabled: boolean) =>
    cn(
      'inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border transition',
      enabled
        ? 'border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50'
        : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300',
    )

  return (
    <div
      className={cn(
        'flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center',
        className,
      )}
    >
      <p className="text-xs text-slate-500 sm:text-sm">
        แสดงหน้า {page} จาก {totalPages} · ทั้งหมด {totalItems} รายการ
      </p>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          className={btnClass(canPrev)}
          aria-label="หน้าก่อนหน้า"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          className={btnClass(canNext)}
          aria-label="หน้าถัดไป"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  )
}

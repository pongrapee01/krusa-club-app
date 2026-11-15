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
      'inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border transition-all duration-200',
      enabled
        ? 'border-slate-200 bg-gradient-to-b from-white to-slate-50 text-slate-600 shadow-ed-btn-soft hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50'
        : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300',
    )

  return (
    <div
      className={cn(
        'flex flex-col items-stretch justify-between gap-3 rounded-3xl border border-white/80 bg-white px-4 py-3 shadow-ed-card sm:flex-row sm:items-center',
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

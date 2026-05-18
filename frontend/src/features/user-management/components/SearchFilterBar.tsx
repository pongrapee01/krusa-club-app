import { Search } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type SearchFilterBarProps = {
  searchPlaceholder: string
  searchValue: string
  onSearchChange: (v: string) => void
  /** ช่อง filter เพิ่มเติม เช่น select ระดับชั้น */
  filters?: ReactNode
  className?: string
}

export function SearchFilterBar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filters,
  className,
}: SearchFilterBarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/35 p-3 shadow-inner shadow-black/20 backdrop-blur-sm lg:flex-row lg:items-center',
        className,
      )}
    >
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">ค้นหา</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/45"
          aria-hidden
        />
        <input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className={cn(
            'h-11 w-full rounded-xl border border-white/15 bg-slate-950/50 pl-10 pr-3 text-sm text-white placeholder:text-white/40',
            'focus-visible:border-orange-400/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/35',
          )}
        />
      </label>
      {filters ? (
        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">{filters}</div>
      ) : null}
    </div>
  )
}

import { Search } from 'lucide-react'
import type { ReactNode } from 'react'

import { ed } from '@/lib/edtech-ui'
import { cn } from '@/lib/utils'

type SearchFilterBarProps = {
  searchPlaceholder: string
  searchValue: string
  onSearchChange: (v: string) => void
  filters?: ReactNode
  /** ปุ่ม action ทางขวา เช่น เพิ่มรายการ — อยู่บรรทัดเดียวกับช่องค้นหา */
  actions?: ReactNode
  className?: string
}

export function SearchFilterBar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filters,
  actions,
  className,
}: SearchFilterBarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-[28px] border border-white/80 bg-gradient-to-b from-white to-slate-50/70 p-4 shadow-ed-card lg:flex-row lg:items-center lg:gap-3',
        className,
      )}
    >
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">ค้นหา</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className={cn(ed.input, 'pl-10')}
        />
      </label>
      {filters || actions ? (
        <div className="flex w-full flex-wrap items-center justify-end gap-3 lg:ml-auto lg:w-auto lg:shrink-0">
          {filters}
          {actions}
        </div>
      ) : null}
    </div>
  )
}

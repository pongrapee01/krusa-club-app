import { cn } from '@/lib/utils'

import type { AccountStatus, EntityStatus } from '@/features/user-management/types'

type BadgeVariant = EntityStatus | AccountStatus | 'neutral'

const styles: Record<BadgeVariant, string> = {
  active: 'bg-emerald-500/20 text-emerald-100 ring-emerald-400/40',
  inactive: 'bg-white/10 text-white/75 ring-white/20',
  locked: 'bg-amber-500/20 text-amber-100 ring-amber-400/45',
  disabled: 'bg-rose-500/20 text-rose-100 ring-rose-400/45',
  neutral: 'bg-slate-500/25 text-white/85 ring-white/15',
}

const labels: Record<BadgeVariant, string> = {
  active: 'Active',
  inactive: 'Inactive',
  locked: 'Locked',
  disabled: 'Disabled',
  neutral: '—',
}

type StatusBadgeProps = {
  status: BadgeVariant
  className?: string
  /** แสดงข้อความภาษาไทยเพิ่มเติม เช่น เหตุผลล็อก */
  subtitle?: string
}

export function StatusBadge({ status, className, subtitle }: StatusBadgeProps) {
  return (
    <span className="inline-flex flex-col gap-0.5">
      <span
        className={cn(
          'inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
          styles[status] ?? styles.neutral,
          className,
        )}
      >
        {labels[status] ?? status}
      </span>
      {subtitle ? <span className="text-[0.65rem] text-white/55">{subtitle}</span> : null}
    </span>
  )
}

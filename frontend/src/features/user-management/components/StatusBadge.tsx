import { cn } from '@/lib/utils'

import type { AccountStatus, EntityStatus } from '@/features/user-management/types'

type BadgeVariant = EntityStatus | AccountStatus | 'neutral'

const styles: Record<BadgeVariant, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
  locked: 'bg-amber-50 text-amber-800 ring-amber-200',
  disabled: 'bg-rose-50 text-rose-700 ring-rose-200',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
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
      {subtitle ? <span className="text-[0.65rem] text-slate-500">{subtitle}</span> : null}
    </span>
  )
}

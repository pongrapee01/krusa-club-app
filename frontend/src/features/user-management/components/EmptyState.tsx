import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20',
        'bg-white/[0.03] px-6 py-14 text-center',
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-orange-500/15 ring-1 ring-orange-400/35">
        <Icon className="size-7 text-orange-200" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

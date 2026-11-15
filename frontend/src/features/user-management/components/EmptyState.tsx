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
        'flex flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-slate-200',
        'bg-slate-50/80 px-6 py-14 text-center',
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-blue-50 shadow-ed-raised ring-1 ring-blue-100">
        <Icon className="size-7 text-blue-500" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

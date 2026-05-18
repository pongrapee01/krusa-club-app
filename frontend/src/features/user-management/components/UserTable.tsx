import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type UserTableColumn<T> = {
  id: string
  header: string
  className?: string
  cell: (row: T) => ReactNode
}

type UserTableProps<T> = {
  columns: UserTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  empty?: ReactNode
}

export function UserTable<T>({ columns, rows, getRowKey, empty }: UserTableProps<T>) {
  if (!rows.length && empty) {
    return <>{empty}</>
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/30 shadow-lg shadow-black/25">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.04]">
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide text-white/70 sm:px-4',
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="transition-colors hover:bg-white/[0.03]">
                {columns.map((col) => (
                  <td key={col.id} className={cn('px-3 py-3 align-middle text-white/90 sm:px-4', col.className)}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

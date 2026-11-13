import type { ReactNode } from 'react'

import { ed } from '@/lib/edtech-ui'
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
    <div className={ed.tableWrap}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className={ed.tableHead}>
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className={cn(ed.tableHeadCell, col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={getRowKey(row)} className={ed.tableRow}>
                {columns.map((col) => (
                  <td key={col.id} className={cn(ed.tableCell, col.className)}>
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

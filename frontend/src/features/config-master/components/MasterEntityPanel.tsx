import { Pencil, Eye, Ban } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AddItemButton } from '@/components/AddItemButton'
import { formatCellValue, getSection } from '@/features/config-master/config/sections'
import { createEmptyRow } from '@/features/config-master/lib/rowDefaults'
import { sortRows } from '@/features/config-master/lib/bundleUtils'
import { MasterCrudModal } from '@/features/config-master/components/MasterCrudModal'
import { ConfirmDialog } from '@/features/user-management/components/ConfirmDialog'
import type { MasterBundle, MasterFormMode, MasterKey } from '@/features/config-master/types'
import { ed } from '@/lib/edtech-ui'
import { cn } from '@/lib/utils'

type MasterEntityPanelProps = {
  sectionKey: MasterKey
  rows: MasterBundle[MasterKey]
  onRowsChange: (rows: MasterBundle[MasterKey]) => void
}

export function MasterEntityPanel({ sectionKey, rows, onRowsChange }: MasterEntityPanelProps) {
  const section = getSection(sectionKey)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<
    | { kind: 'closed' }
    | { kind: 'form'; mode: MasterFormMode; row: Record<string, unknown> | null }
  >({ kind: 'closed' })
  const [disableTarget, setDisableTarget] = useState<Record<string, unknown> | null>(null)

  const sorted = useMemo(
    () => sortRows(rows as Record<string, unknown>[], sectionKey),
    [rows, sectionKey],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter((row) =>
      Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q)),
    )
  }, [sorted, search])

  const parentMenuOptions = useMemo(() => {
    if (sectionKey !== 'menus') return undefined
    const menuRows = rows as MasterBundle['menus']
    return [
      { value: '', label: '— ไม่มี (top-level) —' },
      ...menuRows.map((m) => ({ value: m.code, label: `${m.code} — ${m.label}` })),
    ]
  }, [sectionKey, rows])

  const upsertRow = (values: Record<string, unknown>) => {
    const id = String(values.id ?? '')
    const list = [...(rows as Record<string, unknown>[])]
    const idx = list.findIndex((r) => String(r.id) === id)
    if (idx >= 0) list[idx] = values
    else list.push(values)
    onRowsChange(list as MasterBundle[MasterKey])
    setModal({ kind: 'closed' })
  }

  const confirmDisable = () => {
    if (!disableTarget) return
    const id = String(disableTarget.id)
    const list = (rows as Record<string, unknown>[]).map((r) => {
      if (String(r.id) !== id) return r
      if (sectionKey === 'system_status') return { ...r, status: 'inactive' }
      return { ...r, statusCode: 'inactive' }
    })
    onRowsChange(list as MasterBundle[MasterKey])
    setDisableTarget(null)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className={ed.sectionTitle}>{section.label}</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">{section.description}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="block min-w-0 flex-1">
          <span className="sr-only">ค้นหาในตาราง</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาในตารางนี้…"
            className={ed.input}
          />
        </label>
        <AddItemButton
          label={`เพิ่ม${section.label}`}
          className="ml-auto shrink-0"
          onClick={() =>
            setModal({
              kind: 'form',
              mode: 'create',
              row: createEmptyRow(sectionKey) as Record<string, unknown>,
            })
          }
        />
      </div>

      <div className={ed.tableWrap}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className={ed.tableHead}>
                {section.columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(ed.tableHeadCell, col.className)}
                  >
                    {col.header}
                  </th>
                ))}
                <th scope="col" className={cn(ed.tableHeadCell, 'w-[1%]')}>
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={section.columns.length + 1}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    {search.trim() ? 'ไม่พบข้อมูลตามคำค้นหา' : 'ยังไม่มีรายการ — กดเพิ่มเพื่อเริ่มต้น'}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const statusKey = sectionKey === 'system_status' ? 'status' : 'statusCode'
                  const inactive =
                    row[statusKey] === 'inactive' || row[statusKey] === 'deleted'
                  return (
                    <tr
                      key={String(row.id)}
                      className={cn(ed.tableRow, inactive && 'opacity-60')}
                    >
                      {section.columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(ed.tableCell, col.className)}
                        >
                          {formatCellValue(row[col.key])}
                        </td>
                      ))}
                      <td className="whitespace-nowrap px-3 py-3 sm:px-4">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            className={ed.actionView}
                            onClick={() =>
                              setModal({ kind: 'form', mode: 'view', row: { ...row } })
                            }
                          >
                            <Eye className="size-3.5" aria-hidden />
                            View
                          </button>
                          <button
                            type="button"
                            className={ed.actionEdit}
                            onClick={() =>
                              setModal({ kind: 'form', mode: 'edit', row: { ...row } })
                            }
                          >
                            <Pencil className="size-3.5" aria-hidden />
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={inactive}
                            className={ed.actionDanger}
                            onClick={() => setDisableTarget(row)}
                          >
                            <Ban className="size-3.5" aria-hidden />
                            ปิดใช้งาน
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal.kind === 'form' ? (
        <MasterCrudModal
          open
          mode={modal.mode}
          sectionKey={sectionKey}
          initial={modal.row}
          parentMenuOptions={parentMenuOptions}
          onClose={() => setModal({ kind: 'closed' })}
          onSave={upsertRow}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(disableTarget)}
        title="ปิดใช้งานรายการ?"
        description="ตั้งสถานะเป็น inactive — ยังไม่ลบออกจากระบบจนกว่าจะบันทึกชุด master ทั้งหมด"
        confirmLabel="ปิดใช้งาน"
        tone="danger"
        onConfirm={confirmDisable}
        onCancel={() => setDisableTarget(null)}
      />
    </div>
  )
}

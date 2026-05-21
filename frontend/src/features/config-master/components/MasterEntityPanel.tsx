import { Pencil, Plus, Eye, Ban } from 'lucide-react'
import { useMemo, useState } from 'react'

import { formatCellValue, getSection } from '@/features/config-master/config/sections'
import { createEmptyRow } from '@/features/config-master/lib/rowDefaults'
import { sortRows } from '@/features/config-master/lib/bundleUtils'
import { MasterCrudModal } from '@/features/config-master/components/MasterCrudModal'
import { ConfirmDialog } from '@/features/user-management/components/ConfirmDialog'
import type { MasterBundle, MasterFormMode, MasterKey } from '@/features/config-master/types'
import { cn } from '@/lib/utils'

const addBtnClass =
  'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-green-500/50 bg-green-600 px-5 text-sm font-semibold text-white shadow-md shadow-green-950/40 ring-1 ring-green-400/55 transition hover:border-green-400/65 hover:bg-green-500 hover:ring-green-300/60 active:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'

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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{section.label}</h2>
          <p className="mt-1 max-w-2xl text-sm text-white/70">{section.description}</p>
        </div>
        <button
          type="button"
          className={addBtnClass}
          onClick={() =>
            setModal({
              kind: 'form',
              mode: 'create',
              row: createEmptyRow(sectionKey) as Record<string, unknown>,
            })
          }
        >
          <Plus className="size-4" aria-hidden />
          เพิ่ม{section.label}
        </button>
      </div>

      <label className="block max-w-md">
        <span className="sr-only">ค้นหาในตาราง</span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาในตารางนี้…"
          className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 text-sm text-white placeholder:text-white/40 focus-visible:border-orange-400/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/35"
        />
      </label>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/30 shadow-lg shadow-black/25">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04]">
                {section.columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      'whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide text-white/70 sm:px-4',
                      col.className,
                    )}
                  >
                    {col.header}
                  </th>
                ))}
                <th scope="col" className="w-[1%] px-3 py-3 text-xs font-semibold uppercase text-white/70 sm:px-4">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={section.columns.length + 1}
                    className="px-4 py-10 text-center text-sm text-white/60"
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
                      className={cn(
                        'transition-colors hover:bg-white/[0.03]',
                        inactive && 'opacity-60',
                      )}
                    >
                      {section.columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn('px-3 py-3 align-middle text-white/90 sm:px-4', col.className)}
                        >
                          {formatCellValue(row[col.key])}
                        </td>
                      ))}
                      <td className="whitespace-nowrap px-3 py-3 sm:px-4">
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-sky-200 ring-1 ring-sky-400/35 hover:bg-sky-500/15"
                            onClick={() =>
                              setModal({ kind: 'form', mode: 'view', row: { ...row } })
                            }
                          >
                            <Eye className="size-3.5" aria-hidden />
                            View
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-white ring-1 ring-white/20 hover:bg-white/10"
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
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-200 ring-1 ring-rose-400/35 hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-40"
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

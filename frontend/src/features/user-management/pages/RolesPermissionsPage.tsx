import { Save, Shield } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useUserManagementAudit } from '@/features/user-management/audit/useUserManagementAudit'
import {
  initialPermissionMatrix,
  permissionLabels,
  permissionRowOrder,
  roleColumnOrder,
  roleLabels,
} from '@/features/user-management/mock/permissions-matrix'
import type { PermissionKey, PermissionMatrix, RoleId } from '@/features/user-management/types'
import { ed } from '@/lib/edtech-ui'
import { cn } from '@/lib/utils'

function cloneMatrix(m: PermissionMatrix): PermissionMatrix {
  const out = {} as PermissionMatrix
  for (const k of permissionRowOrder) {
    out[k] = { ...m[k] }
  }
  return out
}

export function RolesPermissionsPage() {
  const { push } = useUserManagementAudit()
  const [matrix, setMatrix] = useState<PermissionMatrix>(() => cloneMatrix(initialPermissionMatrix))
  const [dirty, setDirty] = useState(false)

  const baseline = useMemo(() => cloneMatrix(initialPermissionMatrix), [])

  const toggle = (perm: PermissionKey, role: RoleId) => {
    setMatrix((prev) => ({
      ...prev,
      [perm]: {
        ...prev[perm],
        [role]: !prev[perm][role],
      },
    }))
    setDirty(true)
  }

  const save = () => {
    push({
      action: 'permission_save',
      target: 'Permission matrix',
      detail: 'Mock — บันทึกการตั้งค่า Role × Permission',
    })
    setDirty(false)
  }

  const reset = () => {
    setMatrix(cloneMatrix(baseline))
    setDirty(false)
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className={ed.pageTitle}>Roles & Permissions</h1>
          <p className={ed.pageLead}>
            ตารางสิทธิ์ Role × Permission — ใช้ mock ใน state ก่อนเชื่อม API จริง (รองรับ Parent / Multi-school ในอนาคตด้วยการขยายแถว/คอลัมน์)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={reset} className={ed.btnSecondary}>
            รีเซ็ต
          </button>
          <button
            type="button"
            disabled={!dirty}
            onClick={save}
            className={cn(
              ed.btnPrimary,
              'gap-2 disabled:cursor-not-allowed disabled:opacity-45',
            )}
          >
            <Save className="size-4" aria-hidden />
            Save Changes
          </button>
        </div>
      </header>

      <div className={cn(ed.surface, 'p-4 sm:p-5')}>
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm text-slate-700">
          <Shield className="mt-0.5 size-5 shrink-0 text-blue-600" aria-hidden />
          <p className="leading-relaxed">
            การเปลี่ยนแปลงสิทธิ์ควรบันทึก audit ทุกครั้ง และควรแยก scope โรงเรียน (school_id) เมื่อรองรับหลายโรงเรียน
          </p>
        </div>

        <div className={ed.tableWrap}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className={ed.tableHead}>
                  <th className={ed.tableHeadCell}>Permission</th>
                  {roleColumnOrder.map((role) => (
                    <th key={role} className={cn(ed.tableHeadCell, 'text-center')}>
                      {roleLabels[role]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionRowOrder.map((perm) => (
                  <tr key={perm} className={ed.tableRow}>
                    <td className={cn(ed.tableCell, 'font-medium text-slate-800')}>
                      {permissionLabels[perm]}
                    </td>
                    {roleColumnOrder.map((role) => (
                      <td key={role} className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          className="size-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-400/40"
                          checked={matrix[perm][role]}
                          onChange={() => toggle(perm, role)}
                          aria-label={`${permissionLabels[perm]} — ${roleLabels[role]}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

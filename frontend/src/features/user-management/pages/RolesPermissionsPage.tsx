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
    <section className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Roles & Permissions</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            ตารางสิทธิ์ Role × Permission — ใช้ mock ใน state ก่อนเชื่อม API จริง (รองรับ Parent / Multi-school ในอนาคตด้วยการขยายแถว/คอลัมน์)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reset}
            className="h-11 rounded-full px-4 text-sm font-medium text-white ring-1 ring-white/25 hover:bg-white/10"
          >
            รีเซ็ต
          </button>
          <button
            type="button"
            disabled={!dirty}
            onClick={save}
            className={cn(
              'inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold ring-1 transition',
              dirty
                ? 'bg-orange-600 text-white ring-orange-400/45 hover:bg-orange-500'
                : 'cursor-not-allowed bg-white/10 text-white/45 ring-white/10',
            )}
          >
            <Save className="size-4" aria-hidden />
            Save Changes
          </button>
        </div>
      </header>

      <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-lg shadow-black/25">
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-sky-400/25 bg-sky-500/10 p-3 text-sm text-sky-50/95">
          <Shield className="mt-0.5 size-5 shrink-0 text-sky-200" aria-hidden />
          <p className="leading-relaxed">
            การเปลี่ยนแปลงสิทธิ์ควรบันทึก audit ทุกครั้ง และควรแยก scope โรงเรียน (school_id) เมื่อรองรับหลายโรงเรียน
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04]">
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-white/70">Permission</th>
                {roleColumnOrder.map((role) => (
                  <th
                    key={role}
                    className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white/70"
                  >
                    {roleLabels[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {permissionRowOrder.map((perm) => (
                <tr key={perm} className="hover:bg-white/[0.03]">
                  <td className="px-3 py-2.5 text-white/90">{permissionLabels[perm]}</td>
                  {roleColumnOrder.map((role) => (
                    <td key={role} className="px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-white/30 bg-slate-950 text-orange-500 focus:ring-orange-400"
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
    </section>
  )
}

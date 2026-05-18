import { useUserManagementAudit } from '@/features/user-management/audit/useUserManagementAudit'
import type { AuditAction } from '@/features/user-management/types'
import { formatThaiDateTime } from '@/features/user-management/lib/formatDate'

const actionLabel: Record<AuditAction, string> = {
  create: 'สร้าง',
  update: 'แก้ไข',
  disable: 'ปิดใช้งาน',
  reset_password: 'รีเซ็ตรหัสผ่าน',
  lock: 'ล็อกบัญชี',
  unlock: 'ปลดล็อก',
  permission_save: 'บันทึกสิทธิ์',
  import: 'นำเข้า',
}

export function AuditLogPanel() {
  const { entries } = useUserManagementAudit()

  if (!entries.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-950/25 px-3 py-2 text-xs text-white/55">
        Audit log จะแสดงเมื่อมีการกระทำสำคัญในโมดูลนี้ (mock — เชื่อม API ภายหลัง)
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/35">
      <p className="border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/70">
        Audit log (ล่าสุด)
      </p>
      <ul className="max-h-40 divide-y divide-white/[0.06] overflow-y-auto text-xs">
        {entries.map((e) => (
          <li key={e.id} className="px-3 py-2 text-white/80">
            <span className="text-white/50">{formatThaiDateTime(e.at)}</span>
            <span className="mx-1.5 text-white/35">·</span>
            <span className="font-medium text-orange-200/95">{actionLabel[e.action]}</span>
            <span className="mx-1.5 text-white/35">—</span>
            <span>{e.target}</span>
            {e.detail ? <span className="mt-0.5 block text-white/55">{e.detail}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

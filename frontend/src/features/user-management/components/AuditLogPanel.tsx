import { useUserManagementAudit } from '@/features/user-management/audit/useUserManagementAudit'
import type { AuditAction } from '@/features/user-management/types'
import { formatThaiDateTime } from '@/features/user-management/lib/formatDate'
import { ed } from '@/lib/edtech-ui'
import { cn } from '@/lib/utils'

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
      <div className={cn(ed.surfaceInner, 'px-3 py-2 text-xs text-slate-500')}>
        Audit log จะแสดงเมื่อมีการกระทำสำคัญในโมดูลนี้ (mock — เชื่อม API ภายหลัง)
      </div>
    )
  }

  return (
    <div className={cn(ed.surfaceSoft, 'overflow-hidden p-0')}>
      <p className={cn('border-b border-slate-200 px-3 py-2', ed.labelCaps)}>Audit log (ล่าสุด)</p>
      <ul className="max-h-40 divide-y divide-slate-100 overflow-y-auto text-xs">
        {entries.map((e) => (
          <li key={e.id} className="px-3 py-2 text-slate-700">
            <span className="text-slate-500">{formatThaiDateTime(e.at)}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="font-medium text-blue-700">{actionLabel[e.action]}</span>
            <span className="mx-1.5 text-slate-300">—</span>
            <span>{e.target}</span>
            {e.detail ? <span className="mt-0.5 block text-slate-500">{e.detail}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

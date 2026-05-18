import { Outlet } from 'react-router-dom'

import { UserManagementAuditProvider } from '@/features/user-management/audit/UserManagementAuditProvider'
import { AuditLogPanel } from '@/features/user-management/components/AuditLogPanel'
import { UserManagementInPageNav } from '@/features/user-management/components/UserManagementInPageNav'

/**
 * Shell สำหรับ `/config/users/*` — แท็บ Students / Teachers / … อยู่ในเนื้อหาหน้าเท่านั้น (ไม่ใช้ SubNavSidebar)
 */
export function UserManagementLayout() {
  return (
    <UserManagementAuditProvider>
      <div className="space-y-6">
        <UserManagementInPageNav />
        <Outlet />
        <section aria-label="Audit log" className="max-w-3xl">
          <AuditLogPanel />
        </section>
      </div>
    </UserManagementAuditProvider>
  )
}

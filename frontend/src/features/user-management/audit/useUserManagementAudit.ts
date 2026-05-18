import { useContext } from 'react'

import { UserManagementAuditContext } from '@/features/user-management/audit/user-management-audit-context'

export function useUserManagementAudit() {
  const ctx = useContext(UserManagementAuditContext)
  if (!ctx) {
    throw new Error('useUserManagementAudit must be used within UserManagementAuditProvider')
  }
  return ctx
}

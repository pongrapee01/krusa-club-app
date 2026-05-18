import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { UserManagementAuditContext } from '@/features/user-management/audit/user-management-audit-context'
import type { AuditAction, AuditLogEntry } from '@/features/user-management/types'

function makeId() {
  return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function UserManagementAuditProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])

  const push = useCallback((input: { action: AuditAction; target: string; detail?: string }) => {
    const row: AuditLogEntry = {
      id: makeId(),
      at: new Date().toISOString(),
      actor: 'admin@school.edu',
      action: input.action,
      target: input.target,
      detail: input.detail,
    }
    setEntries((prev) => [row, ...prev].slice(0, 50))
  }, [])

  const value = useMemo(() => ({ entries, push }), [entries, push])

  return (
    <UserManagementAuditContext.Provider value={value}>{children}</UserManagementAuditContext.Provider>
  )
}

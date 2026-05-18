import { createContext } from 'react'

import type { AuditAction, AuditLogEntry } from '@/features/user-management/types'

export type UserManagementAuditContextValue = {
  entries: AuditLogEntry[]
  push: (input: { action: AuditAction; target: string; detail?: string }) => void
}

export const UserManagementAuditContext = createContext<UserManagementAuditContextValue | null>(null)

import { KeyRound, Lock, Shield, Unlock, UserX } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AddItemButton } from '@/components/AddItemButton'
import { useUserManagementAudit } from '@/features/user-management/audit/useUserManagementAudit'
import { ConfirmDialog } from '@/features/user-management/components/ConfirmDialog'
import { EmptyState } from '@/features/user-management/components/EmptyState'
import { Pagination } from '@/features/user-management/components/Pagination'
import { SearchFilterBar } from '@/features/user-management/components/SearchFilterBar'
import { StatusBadge } from '@/features/user-management/components/StatusBadge'
import { UserFormModal } from '@/features/user-management/components/UserFormModal'
import { UserTable, type UserTableColumn } from '@/features/user-management/components/UserTable'
import { formatThaiDateTime } from '@/features/user-management/lib/formatDate'
import { ownerTypeLabel } from '@/features/user-management/lib/labels'
import { paginate } from '@/features/user-management/lib/paginate'
import { ed } from '@/lib/edtech-ui'
import { cn } from '@/lib/utils'
import { mockLoginAccounts } from '@/features/user-management/mock/accounts'
import { mockStudents } from '@/features/user-management/mock/students'
import { mockTeachers } from '@/features/user-management/mock/teachers'
import type {
  AccountRole,
  AccountStatus,
  LoginAccountFormValues,
  LoginAccountRow,
  OwnerType,
} from '@/features/user-management/types'

const PAGE_SIZE = 8

function resolveOwnerName(ownerType: OwnerType, ownerRefId: string, fallback: string) {
  if (ownerType === 'teacher') {
    return mockTeachers.find((t) => t.id === ownerRefId)?.fullName ?? fallback
  }
  if (ownerType === 'student') {
    return mockStudents.find((s) => s.id === ownerRefId)?.fullName ?? fallback
  }
  return fallback
}

export function LoginAccountsPage() {
  const { push } = useUserManagementAudit()
  const [rows, setRows] = useState<LoginAccountRow[]>(() => [...mockLoginAccounts])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<
    | { kind: 'closed' }
    | { kind: 'form'; mode: 'create' | 'edit' | 'view'; row: LoginAccountRow | null }
  >({ kind: 'closed' })
  const [resetTarget, setResetTarget] = useState<LoginAccountRow | null>(null)
  const [disableTarget, setDisableTarget] = useState<LoginAccountRow | null>(null)
  const [lockTarget, setLockTarget] = useState<LoginAccountRow | null>(null)
  const [lockReason, setLockReason] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      const hitSearch =
        !q ||
        r.username.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q)
      const hitRole = roleFilter === 'all' || r.role === roleFilter
      const hitStatus = statusFilter === 'all' || r.status === statusFilter
      return hitSearch && hitRole && hitStatus
    })
  }, [rows, search, roleFilter, statusFilter])

  const { slice, page: safePage, totalPages, total } = paginate(filtered, page, PAGE_SIZE)

  const applyLock = () => {
    if (!lockTarget) return
    setRows((prev) =>
      prev.map((r) =>
        r.id === lockTarget.id
          ? {
              ...r,
              status: 'locked' as const,
              lockReason: lockReason.trim() || 'ล็อกโดยผู้ดูแลระบบ',
            }
          : r,
      ),
    )
    push({
      action: 'lock',
      target: `บัญชี ${lockTarget.username}`,
      detail: lockReason.trim() || undefined,
    })
    setLockTarget(null)
    setLockReason('')
  }

  const applyUnlock = (row: LoginAccountRow) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === row.id ? { ...r, status: 'active' as const, lockReason: undefined } : r,
      ),
    )
    push({ action: 'unlock', target: `บัญชี ${row.username}` })
  }

  const applyDisableAccount = () => {
    if (!disableTarget) return
    setRows((prev) =>
      prev.map((r) => (r.id === disableTarget.id ? { ...r, status: 'disabled' as const } : r)),
    )
    push({
      action: 'disable',
      target: `Login ${disableTarget.username}`,
      detail: 'หยุดการเข้าใช้งาน — ข้อมูลบุคคล (นักเรียน/ครู) ยังอยู่',
    })
    setDisableTarget(null)
  }

  const applyResetPassword = () => {
    if (!resetTarget) return
    push({
      action: 'reset_password',
      target: `บัญชี ${resetTarget.username}`,
      detail: 'Mock — ในระบบจริงส่งลิงก์/รหัสชั่วคราวทางอีเมล',
    })
    setResetTarget(null)
  }

  const onSaveAccount = (values: LoginAccountFormValues) => {
    const ownerName = resolveOwnerName(values.ownerType, values.ownerRefId, '—')
    if (modal.kind === 'form' && modal.mode === 'create') {
      const row: LoginAccountRow = {
        id: `a-${Date.now()}`,
        accountId: `ACC-${2000 + rows.length}`,
        username: values.username,
        email: values.email,
        ownerType: values.ownerType,
        ownerName,
        ownerRefId: values.ownerRefId,
        role: values.role,
        status: values.status,
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
        requirePasswordChange: values.requirePasswordChange,
      }
      setRows((prev) => [row, ...prev])
      push({ action: 'create', target: `Login ${row.username}`, detail: ownerTypeLabel(values.ownerType) })
    } else if (modal.kind === 'form' && modal.row) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === modal.row!.id
            ? {
                ...r,
                username: values.username,
                email: values.email,
                ownerType: values.ownerType,
                ownerRefId: values.ownerRefId,
                ownerName,
                role: values.role,
                status: values.status,
                requirePasswordChange: values.requirePasswordChange,
              }
            : r,
        ),
      )
      push({ action: 'update', target: `Login ${values.username}` })
    }
    setModal({ kind: 'closed' })
  }

  const columns: UserTableColumn<LoginAccountRow>[] = [
    { id: 'aid', header: 'Account ID', cell: (r) => <span className="font-mono text-xs">{r.accountId}</span> },
    { id: 'user', header: 'Username', cell: (r) => <span className="font-mono text-xs text-slate-800">{r.username}</span> },
    { id: 'email', header: 'Email', cell: (r) => <span className="text-xs text-blue-600">{r.email}</span> },
    { id: 'ot', header: 'Owner Type', cell: (r) => ownerTypeLabel(r.ownerType) },
    { id: 'on', header: 'Owner Name', cell: (r) => <span className="text-slate-800">{r.ownerName}</span> },
    { id: 'role', header: 'Role', cell: (r) => <span className="uppercase text-slate-600">{r.role}</span> },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => (
        <StatusBadge
          status={r.status}
          subtitle={r.status === 'locked' ? r.lockReason : undefined}
        />
      ),
    },
    {
      id: 'last',
      header: 'Last Login',
      cell: (r) => (
        <span className="text-xs text-slate-500">{r.lastLoginAt ? formatThaiDateTime(r.lastLoginAt) : '—'}</span>
      ),
    },
    {
      id: 'created',
      header: 'Created',
      cell: (r) => <span className="text-xs text-slate-500">{formatThaiDateTime(r.createdAt)}</span>,
    },
    {
      id: 'actions',
      header: '',
      className: 'min-w-[12rem]',
      cell: (r) => (
        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className={ed.actionView}
            onClick={() => setModal({ kind: 'form', mode: 'view', row: r })}
          >
            View
          </button>
          <button
            type="button"
            className={ed.actionEdit}
            onClick={() => setModal({ kind: 'form', mode: 'edit', row: r })}
          >
            Edit
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 shadow-ed-raised hover:-translate-y-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-50"
            onClick={() => setResetTarget(r)}
          >
            <KeyRound className="size-3.5" aria-hidden />
            Reset
          </button>
          {r.status === 'locked' ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 shadow-ed-raised hover:-translate-y-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-50"
              onClick={() => applyUnlock(r)}
            >
              <Unlock className="size-3.5" aria-hidden />
              Unlock
            </button>
          ) : (
            <button
              type="button"
              disabled={r.status === 'disabled'}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 shadow-ed-raised hover:-translate-y-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-50 disabled:opacity-40"
              onClick={() => {
                setLockReason('')
                setLockTarget(r)
              }}
            >
              <Lock className="size-3.5" aria-hidden />
              Lock
            </button>
          )}
          <button
            type="button"
            disabled={r.status === 'disabled'}
            className={cn(ed.actionDanger, 'inline-flex items-center gap-1')}
            onClick={() => setDisableTarget(r)}
          >
            <UserX className="size-3.5" aria-hidden />
            Disable
          </button>
        </div>
      ),
    },
  ]

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className={ed.pageTitle}>Login Accounts</h1>
        <p className={ed.pageLead}>
          บัญชี Authentication แยกจากโปรไฟล์นักเรียน/ครู — หนึ่งคนอาจมีหรือไม่มีบัญชีก็ได้
        </p>
      </header>

      <SearchFilterBar
        searchPlaceholder="ค้นหา Username, Email, ชื่อเจ้าของบัญชี"
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        actions={
          <AddItemButton
            label="สร้างบัญชีผู้ใช้"
            onClick={() => setModal({ kind: 'form', mode: 'create', row: null })}
          />
        }
        filters={
          <>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setPage(1)
              }}
              className={cn(ed.select, 'min-w-[8rem]')}
            >
              <option value="all">ทุก Role</option>
              {(['admin', 'teacher', 'student'] as AccountRole[]).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className={cn(ed.select, 'min-w-[9rem]')}
            >
              <option value="all">ทุกสถานะบัญชี</option>
              {(['active', 'locked', 'disabled'] as AccountStatus[]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </>
        }
      />

      <UserTable
        columns={columns}
        rows={slice}
        getRowKey={(r) => r.id}
        empty={
          <EmptyState
            icon={Shield}
            title="ไม่พบบัญชี"
            description="ลองค้นหาใหม่หรือสร้างบัญชีผู้ใช้ใหม่"
            action={
              <AddItemButton
                label="สร้างบัญชีผู้ใช้"
                onClick={() => setModal({ kind: 'form', mode: 'create', row: null })}
              />
            }
          />
        }
      />

      {filtered.length > 0 ? (
        <Pagination page={safePage} totalPages={totalPages} totalItems={total} onPageChange={setPage} />
      ) : null}

      {modal.kind === 'form' ? (
        <UserFormModal
          variant="account"
          open
          mode={modal.mode}
          initial={modal.row}
          onClose={() => setModal({ kind: 'closed' })}
          onSave={onSaveAccount}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(resetTarget)}
        title="รีเซ็ตรหัสผ่าน?"
        description={`ยืนยันการรีเซ็ตรหัสผ่านสำหรับบัญชี ${resetTarget?.username ?? ''} — ในระบบจริงควรส่งลิงก์ชั่วคราวหรือ token ทางอีเมล`}
        confirmLabel="รีเซ็ตรหัสผ่าน"
        tone="danger"
        onConfirm={applyResetPassword}
        onCancel={() => setResetTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(disableTarget)}
        title="ปิดการใช้งานบัญชี?"
        description="บัญชีจะถูกตั้งเป็น Disabled — ไม่ลบข้อมูลบุคคลที่เชื่อมโยง"
        confirmLabel="Disable account"
        tone="danger"
        onConfirm={applyDisableAccount}
        onCancel={() => setDisableTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(lockTarget)}
        title="ล็อกบัญชี?"
        description="ผู้ใช้จะไม่สามารถล็อกอินได้จนกว่าจะปลดล็อก — แนะนำให้ระบุเหตุผลเพื่อ audit"
        confirmLabel="ล็อกบัญชี"
        onConfirm={applyLock}
        onCancel={() => {
          setLockTarget(null)
          setLockReason('')
        }}
      >
        <label className="block text-sm text-slate-700">
          <span className={cn(ed.label, 'mb-1 block')}>เหตุผล (แสดงใน UI / audit)</span>
          <textarea
            value={lockReason}
            onChange={(e) => setLockReason(e.target.value)}
            rows={2}
            className={cn(ed.textarea, 'mt-1 resize-y')}
            placeholder="เช่น สงสัยการเข้าถึงผิดปกติ"
          />
        </label>
      </ConfirmDialog>
    </section>
  )
}

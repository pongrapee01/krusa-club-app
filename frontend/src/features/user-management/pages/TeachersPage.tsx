import { Users } from 'lucide-react'
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
import { paginate } from '@/features/user-management/lib/paginate'
import { ed } from '@/lib/edtech-ui'
import { cn } from '@/lib/utils'
import { mockTeachers } from '@/features/user-management/mock/teachers'
import type { TeacherFormValues, TeacherRow, TeacherSubjectGroup } from '@/features/user-management/types'

const PAGE_SIZE = 8

function buildFullName(title: string, first: string, last: string) {
  return `${title}${first} ${last}`.trim()
}

export function TeachersPage() {
  const { push } = useUserManagementAudit()
  const [rows, setRows] = useState<TeacherRow[]>(() => [...mockTeachers])
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<
    | { kind: 'closed' }
    | { kind: 'form'; mode: 'create' | 'edit' | 'view'; row: TeacherRow | null }
  >({ kind: 'closed' })
  const [confirmDisable, setConfirmDisable] = useState<TeacherRow | null>(null)

  const subjectOptions = useMemo(() => {
    const set = new Set<TeacherSubjectGroup>()
    rows.forEach((r) => set.add(r.subjectGroup))
    return [...set].sort((a, b) => a.localeCompare(b, 'th'))
  }, [rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      const hitSearch =
        !q ||
        r.fullName.toLowerCase().includes(q) ||
        r.teacherId.toLowerCase().includes(q) ||
        r.subjectGroup.toLowerCase().includes(q)
      const hitSubject = subjectFilter === 'all' || r.subjectGroup === subjectFilter
      const hitStatus = statusFilter === 'all' || r.status === statusFilter
      return hitSearch && hitSubject && hitStatus
    })
  }, [rows, search, subjectFilter, statusFilter])

  const { slice, page: safePage, totalPages, total } = paginate(filtered, page, PAGE_SIZE)

  const onSaveTeacher = (values: TeacherFormValues) => {
    const fullName = buildFullName(values.title, values.firstName, values.lastName)
    if (modal.kind === 'form' && modal.mode === 'create') {
      const row: TeacherRow = {
        id: `t-${Date.now()}`,
        teacherId: values.teacherId,
        title: values.title,
        firstName: values.firstName,
        lastName: values.lastName,
        fullName,
        subjectGroup: values.subjectGroup,
        position: values.position,
        phone: values.phone,
        email: values.email,
        status: 'active',
        notes: values.notes,
        createdAt: new Date().toISOString(),
      }
      setRows((prev) => [row, ...prev])
      push({ action: 'create', target: `ครู ${row.fullName}`, detail: row.teacherId })
    } else if (modal.kind === 'form' && modal.row) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === modal.row!.id
            ? {
                ...r,
                ...values,
                fullName,
              }
            : r,
        ),
      )
      push({ action: 'update', target: `ครู ${fullName}`, detail: values.teacherId })
    }
    setModal({ kind: 'closed' })
  }

  const disableTeacher = () => {
    if (!confirmDisable) return
    setRows((prev) =>
      prev.map((r) => (r.id === confirmDisable.id ? { ...r, status: 'inactive' as const } : r)),
    )
    push({
      action: 'disable',
      target: `ครู ${confirmDisable.fullName}`,
      detail: 'สถานะ Inactive',
    })
    setConfirmDisable(null)
  }

  const columns: UserTableColumn<TeacherRow>[] = [
    { id: 'tid', header: 'Teacher ID', cell: (r) => <span className="font-mono text-xs">{r.teacherId}</span> },
    { id: 'name', header: 'ชื่อ-นามสกุล', cell: (r) => <span className="font-medium text-slate-900">{r.fullName}</span> },
    { id: 'sg', header: 'กลุ่มสาระ', cell: (r) => <span className="max-w-[10rem] text-slate-700">{r.subjectGroup}</span> },
    { id: 'pos', header: 'ตำแหน่ง', cell: (r) => r.position },
    { id: 'phone', header: 'เบอร์โทร', cell: (r) => <span className="font-mono text-xs">{r.phone}</span> },
    { id: 'email', header: 'Email', cell: (r) => <span className="text-xs text-blue-600">{r.email}</span> },
    { id: 'status', header: 'สถานะ', cell: (r) => <StatusBadge status={r.status} /> },
    {
      id: 'actions',
      header: '',
      className: 'w-[1%] whitespace-nowrap',
      cell: (r) => (
        <div className="flex flex-wrap gap-1">
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
            disabled={r.status === 'inactive'}
            className={ed.actionDanger}
            onClick={() => setConfirmDisable(r)}
          >
            Disable
          </button>
        </div>
      ),
    },
  ]

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className={ed.pageTitle}>Teachers</h1>
        <p className={ed.pageLead}>
          จัดการโปรไฟล์ครูในโรงเรียน — แยกจากบัญชี Login สำหรับเข้าระบบ
        </p>
      </header>

      <SearchFilterBar
        searchPlaceholder="ค้นหาชื่อ, รหัสครู, กลุ่มสาระ"
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        actions={
          <AddItemButton
            label="เพิ่มครู"
            onClick={() => setModal({ kind: 'form', mode: 'create', row: null })}
          />
        }
        filters={
          <>
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value)
                setPage(1)
              }}
              className={cn(ed.select, 'min-w-[10rem] max-w-full')}
            >
              <option value="all">ทุกกลุ่มสาระ</option>
              {subjectOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className={cn(ed.select, 'min-w-[8rem]')}
            >
              <option value="all">ทุกสถานะ</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
            icon={Users}
            title="ไม่พบครูตามเงื่อนไข"
            description="ปรับคำค้นหาหรือตัวกรอง หรือเพิ่มครูใหม่ในระบบ"
            action={
              <AddItemButton
                label="เพิ่มครู"
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
          variant="teacher"
          open
          mode={modal.mode}
          initial={modal.row}
          onClose={() => setModal({ kind: 'closed' })}
          onSave={onSaveTeacher}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmDisable)}
        title="ปิดใช้งานครู?"
        description="ตั้งสถานะ Inactive — ข้อมูลโปรไฟล์ยังอยู่ และไม่ลบ Login Account โดยอัตโนมัติ"
        confirmLabel="ปิดใช้งาน"
        tone="danger"
        onConfirm={disableTeacher}
        onCancel={() => setConfirmDisable(null)}
      />
    </section>
  )
}

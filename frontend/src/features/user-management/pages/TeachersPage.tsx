import { Plus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useUserManagementAudit } from '@/features/user-management/audit/useUserManagementAudit'
import { ConfirmDialog } from '@/features/user-management/components/ConfirmDialog'
import { EmptyState } from '@/features/user-management/components/EmptyState'
import { Pagination } from '@/features/user-management/components/Pagination'
import { SearchFilterBar } from '@/features/user-management/components/SearchFilterBar'
import { StatusBadge } from '@/features/user-management/components/StatusBadge'
import { UserFormModal } from '@/features/user-management/components/UserFormModal'
import { UserTable, type UserTableColumn } from '@/features/user-management/components/UserTable'
import { paginate } from '@/features/user-management/lib/paginate'
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
    { id: 'name', header: 'ชื่อ-นามสกุล', cell: (r) => <span className="font-medium text-white">{r.fullName}</span> },
    { id: 'sg', header: 'กลุ่มสาระ', cell: (r) => <span className="max-w-[10rem] text-white/90">{r.subjectGroup}</span> },
    { id: 'pos', header: 'ตำแหน่ง', cell: (r) => r.position },
    { id: 'phone', header: 'เบอร์โทร', cell: (r) => <span className="font-mono text-xs">{r.phone}</span> },
    { id: 'email', header: 'Email', cell: (r) => <span className="text-xs text-sky-200/90">{r.email}</span> },
    { id: 'status', header: 'สถานะ', cell: (r) => <StatusBadge status={r.status} /> },
    {
      id: 'actions',
      header: '',
      className: 'w-[1%] whitespace-nowrap',
      cell: (r) => (
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-xs font-medium text-sky-200 ring-1 ring-sky-400/35 hover:bg-sky-500/15"
            onClick={() => setModal({ kind: 'form', mode: 'view', row: r })}
          >
            View
          </button>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-xs font-medium text-white ring-1 ring-white/20 hover:bg-white/10"
            onClick={() => setModal({ kind: 'form', mode: 'edit', row: r })}
          >
            Edit
          </button>
          <button
            type="button"
            disabled={r.status === 'inactive'}
            className="rounded-lg px-2 py-1 text-xs font-medium text-rose-200 ring-1 ring-rose-400/35 hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setConfirmDisable(r)}
          >
            Disable
          </button>
        </div>
      ),
    },
  ]

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Teachers</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            จัดการโปรไฟล์ครูในโรงเรียน — แยกจากบัญชี Login สำหรับเข้าระบบ
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ kind: 'form', mode: 'create', row: null })}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-orange-600 px-5 text-sm font-semibold text-white shadow-md shadow-orange-950/35 ring-1 ring-orange-400/45 transition hover:bg-orange-500"
        >
          <Plus className="size-4" aria-hidden />
          เพิ่มครู
        </button>
      </header>

      <SearchFilterBar
        searchPlaceholder="ค้นหาชื่อ, รหัสครู, กลุ่มสาระ"
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        filters={
          <>
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value)
                setPage(1)
              }}
              className="h-11 min-w-[10rem] max-w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 text-sm text-white focus-visible:border-orange-400/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/35"
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
              className="h-11 min-w-[8rem] rounded-xl border border-white/15 bg-slate-950/60 px-3 text-sm text-white focus-visible:border-orange-400/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/35"
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
              <button
                type="button"
                onClick={() => setModal({ kind: 'form', mode: 'create', row: null })}
                className="inline-flex h-10 items-center justify-center rounded-full bg-orange-600 px-4 text-sm font-semibold text-white ring-1 ring-orange-400/45 hover:bg-orange-500"
              >
                เพิ่มครู
              </button>
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

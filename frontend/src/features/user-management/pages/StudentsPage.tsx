import { GraduationCap, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AddItemButton } from '@/components/AddItemButton'
import { useUserManagementAudit } from '@/features/user-management/audit/useUserManagementAudit'
import { ConfirmDialog } from '@/features/user-management/components/ConfirmDialog'
import { EmptyState } from '@/features/user-management/components/EmptyState'
import { Pagination } from '@/features/user-management/components/Pagination'
import { SearchFilterBar } from '@/features/user-management/components/SearchFilterBar'
import { StatusBadge } from '@/features/user-management/components/StatusBadge'
import { StudentImportModal } from '@/features/user-management/components/StudentImportModal'
import { UserFormModal } from '@/features/user-management/components/UserFormModal'
import { UserTable, type UserTableColumn } from '@/features/user-management/components/UserTable'
import { formatThaiDateTime } from '@/features/user-management/lib/formatDate'
import { ed } from '@/lib/edtech-ui'
import { cn } from '@/lib/utils'
import { genderLabel } from '@/features/user-management/lib/labels'
import { paginate } from '@/features/user-management/lib/paginate'
import { mockStudents } from '@/features/user-management/mock/students'
import type { GradeLevel, StudentFormValues, StudentRow } from '@/features/user-management/types'

const PAGE_SIZE = 8
const grades: GradeLevel[] = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6']

function buildFullName(title: string, first: string, last: string) {
  return `${title}${first} ${last}`.trim()
}

function nextStudentId() {
  return `STU-2568-${String(Math.floor(Math.random() * 900) + 100)}`
}

export function StudentsPage() {
  const { push } = useUserManagementAudit()
  const [rows, setRows] = useState<StudentRow[]>(() => [...mockStudents])
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<
    | { kind: 'closed' }
    | { kind: 'form'; mode: 'create' | 'edit' | 'view'; row: StudentRow | null }
  >({ kind: 'closed' })
  const [confirmDisable, setConfirmDisable] = useState<StudentRow | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      const classStr = `${r.gradeLevel}/${r.room}`
      const hitSearch =
        !q ||
        r.fullName.toLowerCase().includes(q) ||
        r.studentId.toLowerCase().includes(q) ||
        classStr.toLowerCase().includes(q)
      const hitGrade = gradeFilter === 'all' || r.gradeLevel === gradeFilter
      return hitSearch && hitGrade
    })
  }, [rows, search, gradeFilter])

  const { slice, page: safePage, totalPages, total } = paginate(filtered, page, PAGE_SIZE)

  const openCreate = () => setModal({ kind: 'form', mode: 'create', row: null })
  const closeModal = () => setModal({ kind: 'closed' })

  const onSaveStudent = (values: StudentFormValues) => {
    const fullName = buildFullName(values.title, values.firstName, values.lastName)
    if (modal.kind === 'form' && modal.mode === 'create') {
      const row: StudentRow = {
        id: `s-${Date.now()}`,
        studentId: values.studentId || nextStudentId(),
        title: values.title,
        firstName: values.firstName,
        lastName: values.lastName,
        fullName,
        gradeLevel: values.gradeLevel,
        room: values.room,
        rollNo: values.rollNo,
        gender: values.gender,
        status: 'active',
        guardianPhone: values.guardianPhone,
        notes: values.notes,
        birthDate: values.birthDate,
        createdAt: new Date().toISOString(),
      }
      setRows((prev) => [row, ...prev])
      push({ action: 'create', target: `นักเรียน ${row.fullName}`, detail: row.studentId })
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
      push({ action: 'update', target: `นักเรียน ${fullName}`, detail: values.studentId })
    }
    closeModal()
  }

  const onImportedStudents = (newRows: StudentRow[]) => {
    if (!newRows.length) return
    setRows((prev) => [...newRows, ...prev])
    setPage(1)
    push({
      action: 'import',
      target: 'นักเรียน (CSV)',
      detail: `นำเข้า ${newRows.length} รายการ`,
    })
  }

  const disableStudent = () => {
    if (!confirmDisable) return
    setRows((prev) =>
      prev.map((r) => (r.id === confirmDisable.id ? { ...r, status: 'inactive' as const } : r)),
    )
    push({
      action: 'disable',
      target: `นักเรียน ${confirmDisable.fullName}`,
      detail: 'สถานะ Inactive (ไม่ลบข้อมูล)',
    })
    setConfirmDisable(null)
  }

  const columns: UserTableColumn<StudentRow>[] = [
    { id: 'sid', header: 'Student ID', cell: (r) => <span className="font-mono text-xs">{r.studentId}</span> },
    { id: 'name', header: 'ชื่อ-นามสกุล', cell: (r) => <span className="font-medium text-slate-900">{r.fullName}</span> },
    { id: 'grade', header: 'ระดับชั้น', cell: (r) => r.gradeLevel },
    { id: 'room', header: 'ห้อง', cell: (r) => r.room },
    { id: 'roll', header: 'เลขที่', cell: (r) => r.rollNo },
    { id: 'gender', header: 'เพศ', cell: (r) => genderLabel(r.gender) },
    {
      id: 'status',
      header: 'สถานะ',
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      id: 'created',
      header: 'วันที่สร้าง',
      cell: (r) => <span className="text-slate-500">{formatThaiDateTime(r.createdAt)}</span>,
    },
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
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className={ed.pageTitle}>Students</h1>
          <p className={ed.pageLead}>
            จัดการข้อมูลบุคคลนักเรียน (โปรไฟล์) แยกจากบัญชี Login — ใช้ Disable แทนการลบข้อมูล
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <button type="button" onClick={() => setImportOpen(true)} className={ed.btnSecondary}>
            <Upload className="size-4" aria-hidden />
            Import CSV
          </button>
        </div>
      </header>

      <SearchFilterBar
        searchPlaceholder="ค้นหาชื่อ, รหัสนักเรียน, ชั้น/ห้อง (เช่น ป.4/1)"
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        actions={<AddItemButton label="เพิ่มนักเรียน" onClick={openCreate} />}
        filters={
          <select
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value)
              setPage(1)
            }}
            className={cn(ed.select, 'min-w-[8.5rem]')}
          >
            <option value="all">ทุกระดับชั้น</option>
            {grades.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        }
      />

      <UserTable
        columns={columns}
        rows={slice}
        getRowKey={(r) => r.id}
        empty={
          <EmptyState
            icon={GraduationCap}
            title="ยังไม่มีนักเรียน"
            description="ลองเปลี่ยนคำค้นหาหรือตัวกรองระดับชั้น หรือกดเพิ่มนักเรียนเพื่อเริ่มบันทึกข้อมูล"
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setImportOpen(true)}
                  className={ed.btnSecondary}
                >
                  <Upload className="size-4" aria-hidden />
                  Import CSV
                </button>
                <AddItemButton label="เพิ่มนักเรียน" onClick={openCreate} />
              </div>
            }
          />
        }
      />

      {filtered.length > 0 ? (
        <Pagination page={safePage} totalPages={totalPages} totalItems={total} onPageChange={setPage} />
      ) : null}

      {modal.kind === 'form' ? (
        <UserFormModal
          variant="student"
          open
          mode={modal.mode}
          initial={modal.row}
          onClose={closeModal}
          onSave={onSaveStudent}
        />
      ) : null}

      <StudentImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={onImportedStudents}
      />

      <ConfirmDialog
        open={Boolean(confirmDisable)}
        title="ปิดใช้งานนักเรียน?"
        description="ระบบจะตั้งสถานะเป็น Inactive และไม่ลบข้อมูลโปรไฟล์ — บัญชี Login (ถ้ามี) ไม่ถูกลบโดยอัตโนมัติจากการกระทำนี้"
        confirmLabel="ปิดใช้งาน"
        tone="danger"
        onConfirm={disableStudent}
        onCancel={() => setConfirmDisable(null)}
      />
    </section>
  )
}

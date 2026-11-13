import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useEffect, useId, useMemo, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { mockStudents } from '@/features/user-management/mock/students'
import { mockTeachers } from '@/features/user-management/mock/teachers'
import type {
  GradeLevel,
  LoginAccountFormValues,
  LoginAccountRow,
  OwnerType,
  StudentFormValues,
  StudentRow,
  TeacherFormValues,
  TeacherRow,
  TeacherSubjectGroup,
} from '@/features/user-management/types'
import {
  fetchStudentGradeMaster,
  fetchStudentRoomsByGrade,
  fetchStudentTitleMaster,
  type StudentMasterOption,
} from '@/services/studentMasterService'
import { ed } from '@/lib/edtech-ui'
import { cn } from '@/lib/utils'

/** รวมค่าที่มีในฟอร์มแต่ยังไม่อยู่ใน master (เช่น ข้อมูลเก่า) เพื่อให้ dropdown แสดงได้ */
function mergeMasterOption(
  fromApi: StudentMasterOption[] | undefined,
  currentLabel: string | undefined,
): StudentMasterOption[] {
  const list = fromApi ?? []
  const cur = currentLabel?.trim()
  if (!cur) return list
  if (list.some((x) => x.label === cur)) return list
  return [{ id: `legacy-${cur.replace(/\s+/g, '-')}`, label: cur }, ...list]
}

const subjectGroups: TeacherSubjectGroup[] = [
  'คณิตศาสตร์',
  'ภาษาไทย',
  'ภาษาอังกฤษ',
  'วิทยาศาสตร์และเทคโนโลยี',
  'สังคมศึกษา ศาสนา และวัฒนธรรม',
  'สุขศึกษาและพลศึกษา',
  'ศิลปะ',
  'การงานอาชีพ',
  'ภาษาต่างประเทศอื่น',
]

const StudentSchema = z.object({
  studentId: z.string().min(1, 'กรอกรหัสนักเรียน'),
  title: z.string().min(1, 'กรอกคำนำหน้า'),
  firstName: z.string().min(1, 'กรอกชื่อ'),
  lastName: z.string().min(1, 'กรอกนามสกุล'),
  gender: z.enum(['male', 'female', 'unspecified']),
  birthDate: z.string().min(1, 'กรอกวันเกิด'),
  gradeLevel: z.enum(['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6']),
  room: z.string().min(1, 'กรอกห้อง'),
  rollNo: z.number().min(1).max(99),
  guardianPhone: z.string().min(1, 'กรอกเบอร์ผู้ปกครอง'),
  notes: z.string(),
})

const TeacherSchema = z.object({
  teacherId: z.string().min(1, 'กรอกรหัสครู'),
  title: z.string().min(1, 'กรอกคำนำหน้า'),
  firstName: z.string().min(1, 'กรอกชื่อ'),
  lastName: z.string().min(1, 'กรอกนามสกุล'),
  subjectGroup: z.enum(
    subjectGroups as unknown as [TeacherSubjectGroup, ...TeacherSubjectGroup[]],
  ),
  position: z.string().min(1, 'กรอกตำแหน่ง'),
  phone: z.string().min(1, 'กรอกเบอร์โทร'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  notes: z.string(),
})

function makeAccountSchema(requirePassword: boolean) {
  return z
    .object({
      ownerType: z.enum(['student', 'teacher', 'admin']),
      ownerRefId: z.string().min(1, 'เลือกเจ้าของบัญชี'),
      username: z.string().min(2, 'กรอก Username'),
      email: z.string().email('อีเมลไม่ถูกต้อง'),
      password: z.string(),
      confirmPassword: z.string(),
      role: z.enum(['admin', 'teacher', 'student']),
      status: z.enum(['active', 'locked', 'disabled']),
      requirePasswordChange: z.boolean(),
    })
    .superRefine((data, ctx) => {
      if (!requirePassword) return
      if (data.password.length < 8) {
        ctx.addIssue({ code: 'custom', path: ['password'], message: 'รหัสผ่านอย่างน้อย 8 ตัวอักษร' })
      }
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirmPassword'],
          message: 'รหัสผ่านไม่ตรงกัน',
        })
      }
    })
}

export type UserFormModalProps =
  | {
      variant: 'student'
      open: boolean
      mode: 'create' | 'edit' | 'view'
      initial: StudentRow | null
      onClose: () => void
      onSave: (values: StudentFormValues) => void
    }
  | {
      variant: 'teacher'
      open: boolean
      mode: 'create' | 'edit' | 'view'
      initial: TeacherRow | null
      onClose: () => void
      onSave: (values: TeacherFormValues) => void
    }
  | {
      variant: 'account'
      open: boolean
      mode: 'create' | 'edit' | 'view'
      initial: LoginAccountRow | null
      onClose: () => void
      onSave: (values: LoginAccountFormValues) => void
    }

const inputClass = cn(ed.input, 'mt-1 py-2 disabled:cursor-not-allowed disabled:opacity-60')
const labelClass = ed.label

function studentToForm(s: StudentRow): StudentFormValues {
  return {
    studentId: s.studentId,
    title: s.title,
    firstName: s.firstName,
    lastName: s.lastName,
    gender: s.gender,
    birthDate: s.birthDate,
    gradeLevel: s.gradeLevel,
    room: s.room,
    rollNo: s.rollNo,
    guardianPhone: s.guardianPhone,
    notes: s.notes,
  }
}

function teacherToForm(t: TeacherRow): TeacherFormValues {
  return {
    teacherId: t.teacherId,
    title: t.title,
    firstName: t.firstName,
    lastName: t.lastName,
    subjectGroup: t.subjectGroup,
    position: t.position,
    phone: t.phone,
    email: t.email,
    notes: t.notes,
  }
}

export function UserFormModal(props: UserFormModalProps) {
  const titleId = useId()
  const { open, onClose } = props

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const readOnly = props.mode === 'view'

  if (props.variant === 'student') {
    return (
      <StudentFormModalInner
        key={`st-${props.mode}-${props.initial?.id ?? 'new'}`}
        titleId={titleId}
        mode={props.mode}
        readOnly={readOnly}
        initial={props.initial}
        onClose={props.onClose}
        onSave={props.onSave}
      />
    )
  }
  if (props.variant === 'teacher') {
    return (
      <TeacherFormModalInner
        key={`tc-${props.mode}-${props.initial?.id ?? 'new'}`}
        titleId={titleId}
        mode={props.mode}
        readOnly={readOnly}
        initial={props.initial}
        onClose={props.onClose}
        onSave={props.onSave}
      />
    )
  }
  return (
    <AccountFormModalInner
      key={`ac-${props.mode}-${props.initial?.id ?? 'new'}`}
      titleId={titleId}
      mode={props.mode}
      readOnly={readOnly}
      initial={props.initial}
      onClose={props.onClose}
      onSave={props.onSave}
    />
  )
}

type InnerProps<T> = {
  titleId: string
  mode: 'create' | 'edit' | 'view'
  readOnly: boolean
  initial: T | null
  onClose: () => void
}

function StudentFormModalInner({
  titleId,
  mode,
  readOnly,
  initial,
  onClose,
  onSave,
}: InnerProps<StudentRow> & { onSave: (v: StudentFormValues) => void }) {
  const defaults: StudentFormValues = useMemo(
    () =>
      initial
        ? studentToForm(initial)
        : {
            studentId: '',
            title: 'เด็กชาย',
            firstName: '',
            lastName: '',
            gender: 'unspecified',
            birthDate: '',
            gradeLevel: 'ป.1',
            room: '1',
            rollNo: 1,
            guardianPhone: '',
            notes: '',
          },
    [initial],
  )

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(StudentSchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    form.reset(defaults)
  }, [defaults, form])

  const titlesQuery = useQuery({
    queryKey: ['master', 'student-titles'],
    queryFn: fetchStudentTitleMaster,
    staleTime: 300_000,
  })
  const gradesQuery = useQuery({
    queryKey: ['master', 'student-grades'],
    queryFn: fetchStudentGradeMaster,
    staleTime: 300_000,
  })

  const gradeLevel = useWatch({ control: form.control, name: 'gradeLevel' }) as GradeLevel | undefined
  const titleVal = useWatch({ control: form.control, name: 'title' })
  const roomVal = useWatch({ control: form.control, name: 'room' })

  const roomsQuery = useQuery({
    queryKey: ['master', 'student-rooms', gradeLevel ?? ''],
    queryFn: () => fetchStudentRoomsByGrade(gradeLevel as GradeLevel),
    enabled: Boolean(gradeLevel),
    staleTime: 300_000,
  })

  const titleOptions = useMemo(
    () => mergeMasterOption(titlesQuery.data, titleVal ?? initial?.title),
    [titlesQuery.data, titleVal, initial?.title],
  )
  const gradeOptions = useMemo(
    () => mergeMasterOption(gradesQuery.data, gradeLevel ?? initial?.gradeLevel),
    [gradesQuery.data, gradeLevel, initial?.gradeLevel],
  )
  const roomOptions = useMemo(
    () => mergeMasterOption(roomsQuery.data, roomVal),
    [roomsQuery.data, roomVal],
  )

  const masterReady =
    Boolean(titlesQuery.data?.length) &&
    Boolean(gradesQuery.data?.length) &&
    Boolean(gradeLevel && roomsQuery.data?.length)

  useEffect(() => {
    const opts = roomsQuery.data
    if (!opts?.length || readOnly) return
    const r = form.getValues('room')
    if (!opts.some((o) => o.label === r)) {
      form.setValue('room', opts[0]!.label)
    }
  }, [roomsQuery.data, gradeLevel, readOnly, form])

  const dialogHeading =
    mode === 'create' ? 'เพิ่มนักเรียน' : mode === 'edit' ? 'แก้ไขนักเรียน' : 'ดูข้อมูลนักเรียน'

  return (
    <ModalChrome titleId={titleId} title={dialogHeading} onClose={onClose}>
      <form
        className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2"
        onSubmit={form.handleSubmit(onSave)}
      >
        <Field label="รหัสนักเรียน (Student ID)">
          <input className={inputClass} disabled={readOnly} {...form.register('studentId')} />
          {form.formState.errors.studentId ? (
            <p className="mt-1 text-xs text-rose-300">{form.formState.errors.studentId.message}</p>
          ) : null}
        </Field>
        <Field label="คำนำหน้า">
          <select
            className={inputClass}
            disabled={readOnly || titlesQuery.isPending}
            {...form.register('title')}
          >
            {titleOptions.map((o) => (
              <option key={o.id} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
          {titlesQuery.isError ? (
            <p className="mt-1 text-xs text-rose-300">โหลดคำนำหน้าไม่สำเร็จ</p>
          ) : null}
        </Field>
        <Field label="ชื่อ">
          <input className={inputClass} disabled={readOnly} {...form.register('firstName')} />
        </Field>
        <Field label="นามสกุล">
          <input className={inputClass} disabled={readOnly} {...form.register('lastName')} />
        </Field>
        <Field label="เพศ">
          <select className={inputClass} disabled={readOnly} {...form.register('gender')}>
            <option value="male">ชาย</option>
            <option value="female">หญิง</option>
            <option value="unspecified">ไม่ระบุ</option>
          </select>
        </Field>
        <Field label="วันเกิด">
          <input type="date" className={inputClass} disabled={readOnly} {...form.register('birthDate')} />
        </Field>
        <Field label="ระดับชั้น">
          <select
            className={inputClass}
            disabled={readOnly || gradesQuery.isPending}
            {...form.register('gradeLevel')}
          >
            {gradeOptions.map((o) => (
              <option key={o.id} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
          {gradesQuery.isError ? (
            <p className="mt-1 text-xs text-rose-300">โหลดระดับชั้นไม่สำเร็จ</p>
          ) : null}
        </Field>
        <Field label="ห้องเรียน">
          <select
            className={inputClass}
            disabled={readOnly || roomsQuery.isPending || !gradeLevel}
            {...form.register('room')}
          >
            {roomOptions.map((o) => (
              <option key={o.id} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
          {roomsQuery.isError ? (
            <p className="mt-1 text-xs text-rose-300">โหลดห้องเรียนไม่สำเร็จ</p>
          ) : null}
        </Field>
        <Field label="เลขที่">
          <input
            type="number"
            className={inputClass}
            disabled={readOnly}
            {...form.register('rollNo', {
              setValueAs: (v) => {
                const n = typeof v === 'number' ? v : Number(v)
                return Number.isFinite(n) && n > 0 ? n : 1
              },
            })}
          />
        </Field>
        <Field label="เบอร์ผู้ปกครอง" className="sm:col-span-2">
          <input className={inputClass} disabled={readOnly} {...form.register('guardianPhone')} />
        </Field>
        <Field label="หมายเหตุ" className="sm:col-span-2">
          <textarea rows={2} className={inputClass} disabled={readOnly} {...form.register('notes')} />
        </Field>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className={ed.btnSecondary}
          >
            ปิด
          </button>
          {!readOnly ? (
            <button
              type="submit"
              disabled={!masterReady}
              className={cn(
                ed.btnPrimary,
                'disabled:cursor-not-allowed disabled:opacity-45',
                !masterReady && 'pointer-events-none opacity-45',
              )}
            >
              บันทึก
            </button>
          ) : null}
        </div>
      </form>
    </ModalChrome>
  )
}

function TeacherFormModalInner({
  titleId,
  mode,
  readOnly,
  initial,
  onClose,
  onSave,
}: InnerProps<TeacherRow> & { onSave: (v: TeacherFormValues) => void }) {
  const defaults: TeacherFormValues = useMemo(
    () =>
      initial
        ? teacherToForm(initial)
        : {
            teacherId: '',
            title: 'นาย',
            firstName: '',
            lastName: '',
            subjectGroup: 'คณิตศาสตร์',
            position: 'ครู',
            phone: '',
            email: '',
            notes: '',
          },
    [initial],
  )

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(TeacherSchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    form.reset(defaults)
  }, [defaults, form])

  const title =
    mode === 'create' ? 'เพิ่มครู' : mode === 'edit' ? 'แก้ไขครู' : 'ดูข้อมูลครู'

  return (
    <ModalChrome titleId={titleId} title={title} onClose={onClose}>
      <form
        className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2"
        onSubmit={form.handleSubmit(onSave)}
      >
        <Field label="รหัสครู (Teacher ID)">
          <input className={inputClass} disabled={readOnly} {...form.register('teacherId')} />
        </Field>
        <Field label="คำนำหน้า">
          <input className={inputClass} disabled={readOnly} {...form.register('title')} />
        </Field>
        <Field label="ชื่อ">
          <input className={inputClass} disabled={readOnly} {...form.register('firstName')} />
        </Field>
        <Field label="นามสกุล">
          <input className={inputClass} disabled={readOnly} {...form.register('lastName')} />
        </Field>
        <Field label="กลุ่มสาระ" className="sm:col-span-2">
          <select className={inputClass} disabled={readOnly} {...form.register('subjectGroup')}>
            {subjectGroups.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="ตำแหน่ง" className="sm:col-span-2">
          <input className={inputClass} disabled={readOnly} {...form.register('position')} />
        </Field>
        <Field label="เบอร์โทร">
          <input className={inputClass} disabled={readOnly} {...form.register('phone')} />
        </Field>
        <Field label="Email">
          <input className={inputClass} disabled={readOnly} {...form.register('email')} />
        </Field>
        <Field label="หมายเหตุ" className="sm:col-span-2">
          <textarea rows={2} className={inputClass} disabled={readOnly} {...form.register('notes')} />
        </Field>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className={ed.btnSecondary}
          >
            ปิด
          </button>
          {!readOnly ? (
            <button
              type="submit"
              className={ed.btnPrimary}
            >
              บันทึก
            </button>
          ) : null}
        </div>
      </form>
    </ModalChrome>
  )
}

type AccountFormValues = LoginAccountFormValues

function AccountFormModalInner({
  titleId,
  mode,
  readOnly,
  initial,
  onClose,
  onSave,
}: InnerProps<LoginAccountRow> & { onSave: (v: LoginAccountFormValues) => void }) {
  const ownerOptions = (ownerType: OwnerType) => {
    if (ownerType === 'admin') {
      return [{ id: 'adm-1', label: 'ผู้ดูแลระบบ (สำนักงาน)' }]
    }
    if (ownerType === 'teacher') {
      return mockTeachers.map((t) => ({ id: t.id, label: t.fullName }))
    }
    return mockStudents.map((s) => ({ id: s.id, label: s.fullName }))
  }

  const defaults: AccountFormValues = useMemo(
    () =>
      initial
        ? {
            ownerType: initial.ownerType,
            ownerRefId: initial.ownerRefId,
            username: initial.username,
            email: initial.email,
            password: '',
            confirmPassword: '',
            role: initial.role,
            status: initial.status,
            requirePasswordChange: initial.requirePasswordChange,
          }
        : {
            ownerType: 'student',
            ownerRefId: mockStudents[0]?.id ?? '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'student',
            status: 'active',
            requirePasswordChange: true,
          },
    [initial],
  )

  const accountSchema = useMemo(() => makeAccountSchema(mode === 'create'), [mode])

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    form.reset(defaults)
  }, [defaults, form])

  const ownerType =
    useWatch({ control: form.control, name: 'ownerType' }) ?? defaults.ownerType

  useEffect(() => {
    const opts = ownerOptions(ownerType)
    const current = form.getValues('ownerRefId')
    if (!opts.some((o) => o.id === current)) {
      form.setValue('ownerRefId', opts[0]?.id ?? '')
    }
  }, [ownerType, form])

  const title =
    mode === 'create'
      ? 'สร้างบัญชีผู้ใช้'
      : mode === 'edit'
        ? 'แก้ไขบัญชีผู้ใช้'
        : 'ดูบัญชีผู้ใช้'

  return (
    <ModalChrome titleId={titleId} title={title} onClose={onClose}>
      <form
        className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2"
        onSubmit={form.handleSubmit(onSave)}
      >
        <Field label="Owner Type">
          <select className={inputClass} disabled={readOnly} {...form.register('ownerType')}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
        <Field label="เจ้าของบัญชี">
          <select className={inputClass} disabled={readOnly} {...form.register('ownerRefId')}>
            {ownerOptions(ownerType).map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Username">
          <input className={inputClass} disabled={readOnly} {...form.register('username')} autoComplete="off" />
        </Field>
        <Field label="Email">
          <input className={inputClass} disabled={readOnly} {...form.register('email')} />
        </Field>
        {!readOnly && mode === 'create' ? (
          <>
            <Field label="Password">
              <input
                type="password"
                className={inputClass}
                {...form.register('password')}
                autoComplete="new-password"
              />
              {form.formState.errors.password ? (
                <p className="mt-1 text-xs text-rose-300">{form.formState.errors.password.message}</p>
              ) : null}
            </Field>
            <Field label="Confirm Password">
              <input type="password" className={inputClass} {...form.register('confirmPassword')} />
              {form.formState.errors.confirmPassword ? (
                <p className="mt-1 text-xs text-rose-300">{form.formState.errors.confirmPassword.message}</p>
              ) : null}
            </Field>
          </>
        ) : null}
        <Field label="Role">
          <select className={inputClass} disabled={readOnly} {...form.register('role')}>
            {(['admin', 'teacher', 'student'] as const).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select className={inputClass} disabled={readOnly} {...form.register('status')}>
            {(['active', 'locked', 'disabled'] as const).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Require password change on first login" className="sm:col-span-2">
          <label className="mt-1 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" disabled={readOnly} {...form.register('requirePasswordChange')} />
            บังคับเปลี่ยนรหัสเมื่อเข้าครั้งแรก
          </label>
        </Field>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className={ed.btnSecondary}
          >
            ปิด
          </button>
          {!readOnly ? (
            <button
              type="submit"
              className={ed.btnPrimary}
            >
              บันทึก
            </button>
          ) : null}
        </div>
      </form>
    </ModalChrome>
  )
}

function ModalChrome({
  titleId,
  title,
  onClose,
  children,
}: {
  titleId: string
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[55] overflow-y-auto overscroll-contain" role="presentation">
      <button
        type="button"
        aria-label="ปิด"
        className="fixed inset-0 cursor-default bg-slate-900/25 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-2xl items-center px-3 py-8 sm:px-4"
      >
        <div className={cn(ed.surface, 'w-full p-5 sm:p-6')}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 id={titleId} className="text-lg font-semibold text-slate-900 sm:text-xl">
              {title}
            </h2>
            <button
              type="button"
              aria-label="ปิด"
              onClick={onClose}
              className={ed.btnGhost}
            >
              <X className="size-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  )
}

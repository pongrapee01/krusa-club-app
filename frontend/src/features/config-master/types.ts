/** Master tables ตาม Frontend-API-Contract (ยกเว้น user_profiles) */
export type MasterKey =
  | 'attendance_status'
  | 'classes'
  | 'menus'
  | 'periods'
  | 'roles'
  | 'semesters'
  | 'subjects'
  | 'system_status'
  | 'titles'

export type StatusCode = 'active' | 'inactive' | 'deleted'

export type SystemStatusRow = {
  id: string
  code: string
  name: string
  status: StatusCode
  sortOrder: number
}

export type TitleRow = {
  id: string
  code: string
  label: string
  sortOrder: number
  statusCode: StatusCode
}

export type AttendanceStatusRow = {
  id: string
  code: string
  label: string
  description: string
  sortOrder: number
  statusCode: StatusCode
}

export type RoleRow = {
  id: string
  code: string
  name: string
  description: string
  statusCode: StatusCode
}

export type SemesterRow = {
  id: string
  code: string
  label: string
  academicYear: number
  term: 1 | 2
  startDate: string
  endDate: string
  isCurrent: boolean
  statusCode: StatusCode
}

export type SubjectRow = {
  id: string
  code: string
  name: string
  sortOrder: number
  statusCode: StatusCode
}

export type PeriodRow = {
  id: string
  periodNo: number
  label: string
  startTime: string
  endTime: string
  sortOrder: number
  statusCode: StatusCode
}

export type ClassRow = {
  id: string
  gradeLevel: string
  room: string
  label: string
  sortOrder: number
  statusCode: StatusCode
}

export type MenuType = 'link' | 'group' | 'divider'

export type MenuRow = {
  id: string
  code: string
  label: string
  path: string
  parentCode: string | null
  icon: string
  sortOrder: number
  matchEnd: boolean
  menuType: MenuType
  statusCode: StatusCode
}

export type MasterBundle = {
  system_status: SystemStatusRow[]
  titles: TitleRow[]
  attendance_status: AttendanceStatusRow[]
  roles: RoleRow[]
  semesters: SemesterRow[]
  subjects: SubjectRow[]
  periods: PeriodRow[]
  classes: ClassRow[]
  menus: MenuRow[]
}

export type MasterRow =
  | SystemStatusRow
  | TitleRow
  | AttendanceStatusRow
  | RoleRow
  | SemesterRow
  | SubjectRow
  | PeriodRow
  | ClassRow
  | MenuRow

export type MasterFormMode = 'create' | 'edit' | 'view'

export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'time'

export type FieldOption = { value: string; label: string }

export type MasterFieldDef = {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  /** สำหรับ select — ถ้าไม่ระบุใช้ status / parent / menuType ตาม name */
  options?: FieldOption[]
  min?: number
  max?: number
}

export type MasterSectionConfig = {
  key: MasterKey
  label: string
  description: string
  fields: MasterFieldDef[]
  /** คอลัมน์ตาราง (accessor เป็น key ของ row) */
  columns: { key: string; header: string; className?: string }[]
}

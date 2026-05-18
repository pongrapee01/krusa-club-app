/** Domain types + table/form shapes — เตรียมต่อกับ studentService / teacherService / accountService */

export type EntityStatus = 'active' | 'inactive'

export type Gender = 'male' | 'female' | 'unspecified'

export type GradeLevel = 'ป.1' | 'ป.2' | 'ป.3' | 'ป.4' | 'ป.5' | 'ป.6'

export type StudentRow = {
  id: string
  studentId: string
  title: string
  firstName: string
  lastName: string
  fullName: string
  gradeLevel: GradeLevel
  room: string
  rollNo: number
  gender: Gender
  status: EntityStatus
  guardianPhone: string
  notes: string
  birthDate: string
  createdAt: string
}

export type StudentFormValues = {
  studentId: string
  title: string
  firstName: string
  lastName: string
  gender: Gender
  birthDate: string
  gradeLevel: GradeLevel
  room: string
  rollNo: number
  guardianPhone: string
  notes: string
}

export type TeacherSubjectGroup =
  | 'คณิตศาสตร์'
  | 'ภาษาไทย'
  | 'ภาษาอังกฤษ'
  | 'วิทยาศาสตร์และเทคโนโลยี'
  | 'สังคมศึกษา ศาสนา และวัฒนธรรม'
  | 'สุขศึกษาและพลศึกษา'
  | 'ศิลปะ'
  | 'การงานอาชีพ'
  | 'ภาษาต่างประเทศอื่น'

export type TeacherRow = {
  id: string
  teacherId: string
  title: string
  firstName: string
  lastName: string
  fullName: string
  subjectGroup: TeacherSubjectGroup
  position: string
  phone: string
  email: string
  status: EntityStatus
  notes: string
  createdAt: string
}

export type TeacherFormValues = {
  teacherId: string
  title: string
  firstName: string
  lastName: string
  subjectGroup: TeacherSubjectGroup
  position: string
  phone: string
  email: string
  notes: string
}

export type OwnerType = 'student' | 'teacher' | 'admin'

export type AccountRole = 'admin' | 'teacher' | 'student'

export type AccountStatus = 'active' | 'locked' | 'disabled'

export type LoginAccountRow = {
  id: string
  accountId: string
  username: string
  email: string
  ownerType: OwnerType
  ownerName: string
  ownerRefId: string
  role: AccountRole
  status: AccountStatus
  lastLoginAt: string | null
  createdAt: string
  requirePasswordChange: boolean
  /** แสดงใน UI เมื่อ status = locked (mock / อนาคตซิงค์จาก API) */
  lockReason?: string
}

export type LoginAccountFormValues = {
  ownerType: OwnerType
  ownerRefId: string
  username: string
  email: string
  password: string
  confirmPassword: string
  role: AccountRole
  status: AccountStatus
  requirePasswordChange: boolean
}

export type AuditAction =
  | 'create'
  | 'update'
  | 'disable'
  | 'reset_password'
  | 'lock'
  | 'unlock'
  | 'permission_save'
  | 'import'

export type AuditLogEntry = {
  id: string
  at: string
  actor: string
  action: AuditAction
  target: string
  detail?: string
}

export type PermissionKey =
  | 'dashboard.view'
  | 'classroom.manage'
  | 'attendance.record'
  | 'users.students'
  | 'users.teachers'
  | 'users.accounts'
  | 'config.master'
  | 'reports.export'

export type RoleId = 'admin' | 'teacher' | 'student' | 'viewer'

export type PermissionMatrix = Record<PermissionKey, Record<RoleId, boolean>>

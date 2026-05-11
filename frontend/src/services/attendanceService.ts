import { env } from '@/lib/env'
import { apiClient } from '@/lib/api/apiClient'
import { getAttendanceMockSession } from '@/mocks/attendanceRollCallMock'

/**
 * สถานะเช็คชื่อ — ส่ง/รับเป็น lowercase กับ API
 * - `leave` = ลาอนุมัติ
 * - `cut_class` = โดดเรียน (เช้ามา บ่ายหาย — รายงานกิจการนักเรียน)
 */
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'cut_class' | 'unknown'

export type RollCallStudentDto = {
  studentId: string
  displayName: string
  seatNumber?: string | null
  avatarUrl?: string | null
  status: AttendanceStatus
  note?: string | null
}

/** ประเภทแผ่นเช็คชื่อ — รายคาบ vs หน้าแถว (ครูประจำชั้น) */
export type AttendanceRollScope = 'period' | 'homeroom'

/** บริบทคาบจากตารางสอน (Smart detect) — ฟิลด์เสริมจาก API */
export type RollCallSessionDto = {
  sessionId: string
  classLabel: string
  sessionDate: string
  /** แผ่นนี้เป็นรายคาบหรือหน้าแถว (ถ้า API ไม่ส่ง จะอิงจาก request) */
  attendanceScope?: AttendanceRollScope
  /** true = ระบบจับคู่คาบจากเวลาจริงได้ */
  smartMatched?: boolean
  periodLabel?: string | null
  subjectName?: string | null
  periodStart?: string | null
  periodEnd?: string | null
  students: RollCallStudentDto[]
}

export type SaveRollCallRequest = {
  sessionId: string
  sessionDate: string
  students: Array<{
    studentId: string
    status: AttendanceStatus
    note?: string | null
  }>
}

const ROLL_CALL_PATH = '/classroom/attendance/roll-call'

export function isAttendanceRollCallMockEnabled(): boolean {
  return env.VITE_USE_ATTENDANCE_MOCK === 'true'
}

/** ลำดับวนสถานะเมื่อกดการ์ด (เริ่มที่มา — กดเปลี่ยนเฉพาะคนที่ไม่ปกติ) */
export const ATTENDANCE_STATUS_CYCLE: AttendanceStatus[] = [
  'present',
  'absent',
  'late',
  'leave',
  'cut_class',
]

export function nextAttendanceStatus(current: AttendanceStatus): AttendanceStatus {
  const c = current === 'unknown' ? 'present' : current
  const i = ATTENDANCE_STATUS_CYCLE.indexOf(c)
  const idx = i === -1 ? 0 : i
  return ATTENDANCE_STATUS_CYCLE[(idx + 1) % ATTENDANCE_STATUS_CYCLE.length]!
}

function asRecord(u: unknown): Record<string, unknown> {
  return u !== null && typeof u === 'object' ? (u as Record<string, unknown>) : {}
}

function pickStr(r: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = r[k]
    if (typeof v === 'string' && v.trim() !== '') return v.trim()
  }
  return undefined
}

function unwrapPayload(data: unknown): unknown {
  const r = asRecord(data)
  if (r.data !== undefined) return r.data
  if (r.result !== undefined) return r.result
  return data
}

const STATUS_SET = new Set<AttendanceStatus>(['present', 'absent', 'late', 'leave', 'cut_class', 'unknown'])

function normalizeStatus(raw: string | undefined): AttendanceStatus {
  if (!raw?.trim()) return 'present'
  const s = raw.toLowerCase()
  if (s === 'excused') return 'leave'
  if (STATUS_SET.has(s as AttendanceStatus)) return s as AttendanceStatus
  return 'unknown'
}

function normalizeStudent(raw: unknown): RollCallStudentDto | null {
  const r = asRecord(raw)
  const studentId = pickStr(r, 'studentId', 'StudentId')
  const displayName =
    pickStr(r, 'displayName', 'DisplayName', 'fullName', 'FullName', 'name', 'Name') ?? ''
  if (!studentId || !displayName.trim()) return null
  const rawStatus = pickStr(r, 'status', 'Status')
  let status = rawStatus ? normalizeStatus(rawStatus) : 'present'
  if (status === 'unknown' && rawStatus?.toLowerCase() !== 'unknown') {
    status = 'present'
  }
  const note = pickStr(r, 'note', 'Note')
  const seatNumber =
    pickStr(r, 'seatNumber', 'SeatNumber', 'rollNumber', 'RollNumber', 'classNumber', 'ClassNumber') ?? null
  const avatarUrl =
    pickStr(r, 'avatarUrl', 'AvatarUrl', 'profileImageUrl', 'ProfileImageUrl', 'photoUrl', 'PhotoUrl') ?? null
  return {
    studentId,
    displayName: displayName.trim(),
    seatNumber,
    avatarUrl,
    status,
    note: note ?? null,
  }
}

function pickBool(r: Record<string, unknown>, ...keys: string[]): boolean | undefined {
  for (const k of keys) {
    const v = r[k]
    if (typeof v === 'boolean') return v
  }
  return undefined
}

function normalizeAttendanceScope(raw: string | undefined): AttendanceRollScope | undefined {
  const s = raw?.trim().toLowerCase()
  if (s === 'homeroom' || s === 'home_room' || s === 'หน้าแถว') return 'homeroom'
  if (s === 'period' || s === 'slot' || s === 'คาบ') return 'period'
  return undefined
}

export function normalizeRollCallSession(raw: unknown): RollCallSessionDto | null {
  const root = unwrapPayload(raw)
  const r = asRecord(root)
  const sessionId = pickStr(r, 'sessionId', 'SessionId')
  const classLabel = pickStr(r, 'classLabel', 'ClassLabel', 'className', 'ClassName') ?? 'ชั้นเรียน'
  const sessionDate = pickStr(r, 'sessionDate', 'SessionDate', 'date', 'Date') ?? ''
  if (!sessionId || !sessionDate) return null

  const rawStudents = r.students ?? r.Students
  if (!Array.isArray(rawStudents)) return null

  const students = rawStudents.map(normalizeStudent).filter((x): x is RollCallStudentDto => x !== null)

  const smartMatched = pickBool(r, 'smartMatched', 'SmartMatched')
  const periodLabel = pickStr(r, 'periodLabel', 'PeriodLabel', 'slotLabel', 'SlotLabel') ?? null
  const subjectName = pickStr(r, 'subjectName', 'SubjectName', 'courseName', 'CourseName') ?? null
  const periodStart = pickStr(r, 'periodStart', 'PeriodStart', 'startTime', 'StartTime') ?? null
  const periodEnd = pickStr(r, 'periodEnd', 'PeriodEnd', 'endTime', 'EndTime') ?? null

  const scopeRaw = pickStr(r, 'attendanceScope', 'AttendanceScope', 'rollCallScope', 'RollCallScope', 'scope', 'Scope')
  const attendanceScope = normalizeAttendanceScope(scopeRaw)

  return {
    sessionId,
    classLabel,
    sessionDate,
    students,
    ...(attendanceScope ? { attendanceScope } : {}),
    ...(smartMatched !== undefined ? { smartMatched } : {}),
    periodLabel,
    subjectName,
    periodStart,
    periodEnd,
  }
}

export type FetchRollCallSessionParams = {
  /** โหมดย้อนหลัง: วัน-เวลา (รูปแบบ `datetime-local` เช่น `2026-05-10T08:30`) — backend ใช้หาแผ่น/คาบ */
  at?: string
  /** `period` = รายคาบ (ค่าเริ่มต้น), `homeroom` = หน้าแถว */
  scope?: AttendanceRollScope
}

function buildRollCallGetQuery(params?: FetchRollCallSessionParams): Record<string, string> | undefined {
  if (!params?.at?.trim()) {
    if (params?.scope === 'homeroom') return { scope: 'homeroom' }
    return undefined
  }
  const q: Record<string, string> = { at: params.at.trim() }
  if (params.scope === 'homeroom') q.scope = 'homeroom'
  else q.scope = 'period'
  return q
}

/**
 * โหลดแผ่นเช็คชื่อ
 * - ไม่ส่ง `at` + `scope` เป็น `period` หรือไม่ส่ง scope → **Smart detect รายคาบ** (ไม่ใส่ query — เหมือนเดิม)
 * - ไม่ส่ง `at` + `scope: 'homeroom'` → **หน้าแถววันนี้** (`?scope=homeroom`)
 * - ส่ง `at` → แก้/ดูย้อนหลังตามวัน-เวลา (`?at=...&scope=...`)
 */
export async function fetchRollCallSession(params?: FetchRollCallSessionParams): Promise<RollCallSessionDto> {
  if (isAttendanceRollCallMockEnabled()) {
    await new Promise((r) => setTimeout(r, 280))
    return getAttendanceMockSession(params)
  }
  const query = buildRollCallGetQuery(params)
  const data = await apiClient.get<unknown>(ROLL_CALL_PATH, query ? { query } : undefined)
  const session = normalizeRollCallSession(data)
  if (!session) {
    throw new Error('รูปแบบข้อมูลเช็คชื่อจากเซิร์ฟเวอร์ไม่ถูกต้อง')
  }
  return session
}

export async function saveRollCallSession(body: SaveRollCallRequest): Promise<void> {
  if (isAttendanceRollCallMockEnabled()) {
    await new Promise((r) => setTimeout(r, 400))
    return
  }
  await apiClient.put<void>(ROLL_CALL_PATH, body)
}

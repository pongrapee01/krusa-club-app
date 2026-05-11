import type { FetchRollCallSessionParams, RollCallSessionDto, RollCallStudentDto } from '@/services/attendanceService'

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function todayIsoDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function sessionDateFromParams(params?: FetchRollCallSessionParams): string {
  const at = params?.at?.trim()
  if (at?.includes('T')) return at.slice(0, 10)
  return todayIsoDate()
}

/**
 * รายชื่อตัวอย่าง — ผสมสถานะเพื่อดูสีแถบ/ชิปบนการ์ด (avatarUrl ว่าง = อักษรย่อ)
 */
const MOCK_STUDENTS: RollCallStudentDto[] = [
  {
    studentId: 'mock-001',
    displayName: 'สมชาย ใจดี',
    seatNumber: '1',
    avatarUrl: null,
    status: 'present',
    note: null,
  },
  {
    studentId: 'mock-002',
    displayName: 'สมหญิง รักเรียน',
    seatNumber: '2',
    avatarUrl: null,
    status: 'present',
    note: null,
  },
  {
    studentId: 'mock-003',
    displayName: 'ประเสริฐ วิริยะ',
    seatNumber: '3',
    avatarUrl: null,
    status: 'late',
    note: null,
  },
  {
    studentId: 'mock-004',
    displayName: 'วิภา แสงทอง',
    seatNumber: '4',
    avatarUrl: null,
    status: 'absent',
    note: 'ติดธุระครอบครัว',
  },
  {
    studentId: 'mock-005',
    displayName: 'กิตติ ศรีสุข',
    seatNumber: '5',
    avatarUrl: null,
    status: 'present',
    note: null,
  },
  {
    studentId: 'mock-006',
    displayName: 'นภัสวรรณ ดีงาม',
    seatNumber: '6',
    avatarUrl: null,
    status: 'leave',
    note: 'ลาป่วยมีใบรับรอง',
  },
  {
    studentId: 'mock-007',
    displayName: 'ธนกฤต มั่นคง',
    seatNumber: '7',
    avatarUrl: null,
    status: 'present',
    note: null,
  },
  {
    studentId: 'mock-008',
    displayName: 'ปภาวรินทร์ เก่งกาจ',
    seatNumber: '8',
    avatarUrl: null,
    status: 'cut_class',
    note: null,
  },
  {
    studentId: 'mock-009',
    displayName: 'อาทิตย์ สว่างจิต',
    seatNumber: '9',
    avatarUrl: null,
    status: 'present',
    note: null,
  },
  {
    studentId: 'mock-010',
    displayName: 'ชลธิชา พัฒนากิจ',
    seatNumber: '10',
    avatarUrl: null,
    status: 'present',
    note: null,
  },
  {
    studentId: 'mock-011',
    displayName: 'ณัฐพล ใจกล้า',
    seatNumber: '11',
    avatarUrl: null,
    status: 'present',
    note: null,
  },
  {
    studentId: 'mock-012',
    displayName: 'พิมพ์ชนก แก้วใส',
    seatNumber: '12',
    avatarUrl: null,
    status: 'present',
    note: null,
  },
]

export function getAttendanceMockSession(params?: FetchRollCallSessionParams): RollCallSessionDto {
  const isHomeroom = params?.scope === 'homeroom'
  const isHistory = Boolean(params?.at?.trim())
  const sessionDate = sessionDateFromParams(params)

  if (isHomeroom) {
    return {
      sessionId: '00000000-0000-4000-8000-00000000a101',
      classLabel: 'ม.3/1',
      sessionDate,
      attendanceScope: 'homeroom',
      smartMatched: !isHistory,
      periodLabel: isHistory ? 'หน้าแถว (ย้อนหลัง)' : 'หน้าแถว — ก่อนเข้าคาบแรก',
      subjectName: null,
      periodStart: '07:30',
      periodEnd: '08:20',
      students: MOCK_STUDENTS.map((s) => ({ ...s })),
    }
  }

  return {
    sessionId: '00000000-0000-4000-8000-00000000a100',
    classLabel: 'ม.3/1',
    sessionDate,
    attendanceScope: 'period',
    smartMatched: !isHistory,
    periodLabel: isHistory ? 'คาบที่ตรงกับเวลาที่เลือก' : 'คาบ 4',
    subjectName: 'วิทยาศาสตร์ (ฟิสิกส์)',
    periodStart: '10:20',
    periodEnd: '11:10',
    students: MOCK_STUDENTS.map((s) => ({ ...s })),
  }
}

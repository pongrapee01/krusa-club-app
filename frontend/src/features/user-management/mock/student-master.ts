import type { GradeLevel } from '@/features/user-management/types'

/** คำนำหน้า — ต่อ API: GET /master/student-titles */
export const mockStudentTitleMaster: { id: string; label: string }[] = [
  { id: 'tit-001', label: 'เด็กชาย' },
  { id: 'tit-002', label: 'เด็กหญิง' },
  { id: 'tit-003', label: 'นาย' },
  { id: 'tit-004', label: 'นาง' },
  { id: 'tit-005', label: 'นางสาว' },
]

/** ระดับชั้น — ต่อ API: GET /master/grade-levels */
export const mockStudentGradeMaster: GradeLevel[] = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6']

/**
 * ห้องเรียนตามระดับชั้น — ต่อ API: GET /master/rooms?gradeLevel=ป.4
 * (mock: แต่ละชั้นมีห้อง 1–4)
 */
export const mockStudentRoomsByGrade: Record<GradeLevel, { id: string; label: string }[]> = {
  'ป.1': [
    { id: 'rm-p1-1', label: '1' },
    { id: 'rm-p1-2', label: '2' },
    { id: 'rm-p1-3', label: '3' },
  ],
  'ป.2': [
    { id: 'rm-p2-1', label: '1' },
    { id: 'rm-p2-2', label: '2' },
    { id: 'rm-p2-3', label: '3' },
    { id: 'rm-p2-4', label: '4' },
  ],
  'ป.3': [
    { id: 'rm-p3-1', label: '1' },
    { id: 'rm-p3-2', label: '2' },
    { id: 'rm-p3-3', label: '3' },
  ],
  'ป.4': [
    { id: 'rm-p4-1', label: '1' },
    { id: 'rm-p4-2', label: '2' },
    { id: 'rm-p4-3', label: '3' },
    { id: 'rm-p4-4', label: '4' },
    { id: 'rm-p4-5', label: '5' },
  ],
  'ป.5': [
    { id: 'rm-p5-1', label: '1' },
    { id: 'rm-p5-2', label: '2' },
    { id: 'rm-p5-3', label: '3' },
  ],
  'ป.6': [
    { id: 'rm-p6-1', label: '1' },
    { id: 'rm-p6-2', label: '2' },
    { id: 'rm-p6-3', label: '3' },
    { id: 'rm-p6-4', label: '4' },
  ],
}

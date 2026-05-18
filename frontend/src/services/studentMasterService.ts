import type { GradeLevel } from '@/features/user-management/types'
import {
  mockStudentGradeMaster,
  mockStudentRoomsByGrade,
  mockStudentTitleMaster,
} from '@/features/user-management/mock/student-master'

export type StudentMasterOption = { id: string; label: string }

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

/**
 * Master คำนำหน้านักเรียน — แทนที่ด้วย `GET /master/student-titles` (หรือรวมใน bundle master)
 */
export async function fetchStudentTitleMaster(): Promise<StudentMasterOption[]> {
  await delay(100)
  return [...mockStudentTitleMaster]
}

/** Master ระดับชั้น */
export async function fetchStudentGradeMaster(): Promise<StudentMasterOption[]> {
  await delay(80)
  return mockStudentGradeMaster.map((g) => ({ id: g, label: g }))
}

/** Master ห้องเรียนตามระดับชั้น */
export async function fetchStudentRoomsByGrade(gradeLevel: GradeLevel): Promise<StudentMasterOption[]> {
  await delay(100)
  return [...(mockStudentRoomsByGrade[gradeLevel] ?? [{ id: 'rm-default', label: '1' }])]
}

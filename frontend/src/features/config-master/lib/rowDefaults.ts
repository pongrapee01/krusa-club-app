import { newRowId } from '@/features/config-master/config/sections'
import type {
  AttendanceStatusRow,
  ClassRow,
  MasterBundle,
  MasterKey,
  MenuRow,
  PeriodRow,
  RoleRow,
  SemesterRow,
  SubjectRow,
  SystemStatusRow,
  TitleRow,
} from '@/features/config-master/types'

export function createEmptyRow(key: MasterKey): MasterBundle[MasterKey][number] {
  switch (key) {
    case 'system_status':
      return {
        id: newRowId('ss'),
        code: '',
        name: '',
        status: 'active',
        sortOrder: 99,
      } satisfies SystemStatusRow
    case 'titles':
      return {
        id: newRowId('t'),
        code: '',
        label: '',
        sortOrder: 99,
        statusCode: 'active',
      } satisfies TitleRow
    case 'attendance_status':
      return {
        id: newRowId('as'),
        code: '',
        label: '',
        description: '',
        sortOrder: 99,
        statusCode: 'active',
      } satisfies AttendanceStatusRow
    case 'roles':
      return {
        id: newRowId('r'),
        code: '',
        name: '',
        description: '',
        statusCode: 'active',
      } satisfies RoleRow
    case 'semesters':
      return {
        id: newRowId('sem'),
        code: '',
        label: '',
        academicYear: 2568,
        term: 1,
        startDate: '',
        endDate: '',
        isCurrent: false,
        statusCode: 'active',
      } satisfies SemesterRow
    case 'subjects':
      return {
        id: newRowId('sub'),
        code: '',
        name: '',
        sortOrder: 99,
        statusCode: 'active',
      } satisfies SubjectRow
    case 'periods':
      return {
        id: newRowId('p'),
        periodNo: 1,
        label: '',
        startTime: '08:00',
        endTime: '08:50',
        sortOrder: 99,
        statusCode: 'active',
      } satisfies PeriodRow
    case 'classes':
      return {
        id: newRowId('c'),
        gradeLevel: '',
        room: '',
        label: '',
        sortOrder: 99,
        statusCode: 'active',
      } satisfies ClassRow
    case 'menus':
      return {
        id: newRowId('m'),
        code: '',
        label: '',
        path: '/',
        parentCode: null,
        icon: '',
        sortOrder: 99,
        matchEnd: false,
        menuType: 'link',
        statusCode: 'active',
      } satisfies MenuRow
    default:
      throw new Error(`Unknown master key: ${key}`)
  }
}

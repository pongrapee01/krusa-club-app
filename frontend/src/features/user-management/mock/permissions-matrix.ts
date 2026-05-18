import type { PermissionKey, PermissionMatrix, RoleId } from '@/features/user-management/types'

export const permissionLabels: Record<PermissionKey, string> = {
  'dashboard.view': 'ดูแดชบอร์ด',
  'classroom.manage': 'จัดการห้องเรียน',
  'attendance.record': 'บันทึกการมาเรียน',
  'users.students': 'จัดการนักเรียน',
  'users.teachers': 'จัดการครู',
  'users.accounts': 'จัดการบัญชีเข้าใช้งาน',
  'config.master': 'ข้อมูล Master',
  'reports.export': 'ส่งออกรายงาน',
}

export const roleLabels: Record<RoleId, string> = {
  admin: 'Admin',
  teacher: 'Teacher',
  student: 'Student',
  viewer: 'Viewer',
}

export const roleColumnOrder: RoleId[] = ['admin', 'teacher', 'student', 'viewer']

export const initialPermissionMatrix: PermissionMatrix = {
  'dashboard.view': { admin: true, teacher: true, student: true, viewer: true },
  'classroom.manage': { admin: true, teacher: true, student: false, viewer: false },
  'attendance.record': { admin: true, teacher: true, student: false, viewer: false },
  'users.students': { admin: true, teacher: false, student: false, viewer: false },
  'users.teachers': { admin: true, teacher: false, student: false, viewer: false },
  'users.accounts': { admin: true, teacher: false, student: false, viewer: false },
  'config.master': { admin: true, teacher: false, student: false, viewer: false },
  'reports.export': { admin: true, teacher: true, student: false, viewer: true },
}

export const permissionRowOrder: PermissionKey[] = [
  'dashboard.view',
  'classroom.manage',
  'attendance.record',
  'users.students',
  'users.teachers',
  'users.accounts',
  'config.master',
  'reports.export',
]

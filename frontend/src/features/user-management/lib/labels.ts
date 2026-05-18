import type { Gender } from '@/features/user-management/types'

export function genderLabel(g: Gender) {
  if (g === 'male') return 'ชาย'
  if (g === 'female') return 'หญิง'
  return 'ไม่ระบุ'
}

export function ownerTypeLabel(o: string) {
  if (o === 'student') return 'Student'
  if (o === 'teacher') return 'Teacher'
  return 'Admin'
}

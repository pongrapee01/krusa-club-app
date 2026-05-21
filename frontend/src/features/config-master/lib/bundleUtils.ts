import type { MasterBundle, MasterKey } from '@/features/config-master/types'

export function cloneMasterBundle(bundle: MasterBundle): MasterBundle {
  return structuredClone(bundle)
}

export function bundlesEqual(a: MasterBundle, b: MasterBundle): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function sortRows<T extends Record<string, unknown>>(rows: T[], key: MasterKey): T[] {
  const copy = [...rows]
  if (key === 'semesters') {
    return copy.sort(
      (a, b) =>
        Number((b as { academicYear?: number }).academicYear ?? 0) -
          Number((a as { academicYear?: number }).academicYear ?? 0) ||
        Number((a as { term?: number }).term ?? 0) - Number((b as { term?: number }).term ?? 0),
    )
  }
  const sortKey =
    key === 'periods' ? 'periodNo' : 'sortOrder' in (copy[0] ?? {}) ? 'sortOrder' : 'code'
  return copy.sort((a, b) => {
    const av = a[sortKey as keyof T]
    const bv = b[sortKey as keyof T]
    if (typeof av === 'number' && typeof bv === 'number') return av - bv
    return String(av ?? '').localeCompare(String(bv ?? ''), 'th')
  })
}

export function countDirtySections(draft: MasterBundle, saved: MasterBundle): number {
  let n = 0
  for (const key of Object.keys(draft) as MasterKey[]) {
    if (JSON.stringify(draft[key]) !== JSON.stringify(saved[key])) n += 1
  }
  return n
}

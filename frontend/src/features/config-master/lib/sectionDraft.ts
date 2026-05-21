import type { MasterBundle, MasterKey } from '@/features/config-master/types'

export function isSectionDirty(
  key: MasterKey,
  draft: MasterBundle[MasterKey] | undefined,
  server: MasterBundle | null,
): boolean {
  if (!draft || !server) return false
  return JSON.stringify(draft) !== JSON.stringify(server[key])
}

export function getSectionRows(
  key: MasterKey,
  server: MasterBundle,
  sectionDrafts: Partial<Record<MasterKey, MasterBundle[MasterKey]>>,
): MasterBundle[MasterKey] {
  return sectionDrafts[key] ?? server[key]
}

import { initialMasterBundle } from '@/features/config-master/mock/seed'
import type { MasterBundle, MasterKey } from '@/features/config-master/types'
import { apiClient } from '@/lib/api/apiClient'

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

let mockStore: MasterBundle = structuredClone(initialMasterBundle)

function cloneBundle(b: MasterBundle): MasterBundle {
  return structuredClone(b)
}

function isMasterBundle(value: unknown): value is MasterBundle {
  if (!value || typeof value !== 'object') return false
  const o = value as Record<string, unknown>
  return (
    Array.isArray(o.system_status) &&
    Array.isArray(o.titles) &&
    Array.isArray(o.attendance_status) &&
    Array.isArray(o.menus)
  )
}

function unwrapBundle(payload: unknown): MasterBundle | null {
  if (isMasterBundle(payload)) return payload
  if (payload && typeof payload === 'object') {
    const data = (payload as { data?: unknown }).data
    if (isMasterBundle(data)) return data
  }
  return null
}

/**
 * โหลด master ทั้งชุดครั้งเดียว — ต่อ API: `GET /master/bundle`
 */
export async function fetchMasterBundle(): Promise<MasterBundle> {
  try {
    const payload = await apiClient.get<unknown>('/master/bundle')
    const parsed = unwrapBundle(payload)
    if (parsed) {
      mockStore = cloneBundle(parsed)
      return parsed
    }
  } catch {
    /* fallback mock */
  }
  await delay(120)
  return cloneBundle(mockStore)
}

/**
 * บันทึก master ทั้งชุด — ต่อ API: `PUT /master/bundle` (ใช้เมื่อ backend รองรับ bulk)
 */
export async function saveMasterBundle(bundle: MasterBundle): Promise<MasterBundle> {
  try {
    const payload = await apiClient.put<unknown, MasterBundle>('/master/bundle', bundle)
    const parsed = unwrapBundle(payload)
    if (parsed) {
      mockStore = cloneBundle(parsed)
      return parsed
    }
  } catch {
    /* fallback mock */
  }
  await delay(280)
  mockStore = cloneBundle(bundle)
  return cloneBundle(mockStore)
}

/**
 * บันทึก master หนึ่งกลุ่ม (แท็บปัจจุบัน) — ต่อ API: `PUT /master/bundle/:key`
 */
export async function saveMasterSection<K extends MasterKey>(
  key: K,
  rows: MasterBundle[K],
): Promise<MasterBundle> {
  try {
    const payload = await apiClient.put<unknown, MasterBundle[K] | { data: MasterBundle[K] }>(
      `/master/bundle/${key}`,
      rows,
    )
    const sectionRows = Array.isArray(payload)
      ? payload
      : payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)
        ? (payload as { data: MasterBundle[K] }).data
        : null
    if (sectionRows) {
      mockStore = { ...mockStore, [key]: structuredClone(sectionRows) }
      return cloneBundle(mockStore)
    }
  } catch {
    /* fallback mock */
  }
  await delay(220)
  mockStore = { ...mockStore, [key]: structuredClone(rows) }
  return cloneBundle(mockStore)
}

import { initialMasterBundle } from '@/features/config-master/mock/seed'
import type {
  ClassRow,
  MasterBundle,
  MasterKey,
  MenuRow,
  PeriodRow,
  RoleRow,
  SemesterRow,
  SystemStatusRow,
  TitleRow,
} from '@/features/config-master/types'
import { env } from '@/lib/env'
import { apiClient } from '@/lib/api/apiClient'
import {
  mapClassFromApi,
  mapClassToApi,
  mapMenuToApi,
  mapMenusFromApi,
  mapPeriodFromApi,
  mapPeriodToApi,
  mapRoleFromApi,
  mapRoleToApi,
  mapSemesterFromApi,
  mapSemesterToApi,
  mapSystemStatusFromApi,
  mapSystemStatusToApi,
  mapTitleFromApi,
  mapTitleToApi,
} from '@/services/masterApiMappers'
import type {
  MasterClassApiDto,
  MasterMenuApiDto,
  MasterPeriodApiDto,
  MasterRoleApiDto,
  MasterSemesterApiDto,
  MasterSystemStatusApiDto,
  MasterTitleApiDto,
} from '@/services/masterApiTypes'

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

let mockStore: MasterBundle = structuredClone(initialMasterBundle)

function cloneBundle(b: MasterBundle): MasterBundle {
  return structuredClone(b)
}

function hasApiBase(): boolean {
  return Boolean(env.VITE_API_BASE_URL?.trim())
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

function unwrapArray<T>(payload: unknown): T[] | null {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const data = (payload as { data?: unknown }).data
    if (Array.isArray(data)) return data as T[]
  }
  return null
}

/** GET /master/roles */
export async function fetchMasterRoles(): Promise<RoleRow[] | null> {
  const payload = await apiClient.get<unknown>('/master/roles')
  const rows = unwrapArray<MasterRoleApiDto>(payload)
  if (!rows) return null
  return rows.map(mapRoleFromApi)
}

/** GET /master/titles */
export async function fetchMasterTitles(): Promise<TitleRow[] | null> {
  const payload = await apiClient.get<unknown>('/master/titles')
  const rows = unwrapArray<MasterTitleApiDto>(payload)
  if (!rows) return null
  return rows.map((dto, index) => mapTitleFromApi(dto, index + 1))
}

/** GET /master/semesters */
export async function fetchMasterSemesters(): Promise<SemesterRow[] | null> {
  const payload = await apiClient.get<unknown>('/master/semesters')
  const rows = unwrapArray<MasterSemesterApiDto>(payload)
  if (!rows) return null
  return rows.map(mapSemesterFromApi)
}

/** GET /master/classes */
export async function fetchMasterClasses(): Promise<ClassRow[] | null> {
  const payload = await apiClient.get<unknown>('/master/classes')
  const rows = unwrapArray<MasterClassApiDto>(payload)
  if (!rows) return null
  return rows.map((dto, index) => mapClassFromApi(dto, index + 1))
}

/** GET /master/periods */
export async function fetchMasterPeriods(): Promise<PeriodRow[] | null> {
  const payload = await apiClient.get<unknown>('/master/periods')
  const rows = unwrapArray<MasterPeriodApiDto>(payload)
  if (!rows) return null
  return rows.map((dto, index) => mapPeriodFromApi(dto, index + 1))
}

/** GET /master/system-statuses */
export async function fetchMasterSystemStatuses(): Promise<SystemStatusRow[] | null> {
  const payload = await apiClient.get<unknown>('/master/system-statuses')
  const rows = unwrapArray<MasterSystemStatusApiDto>(payload)
  if (!rows) return null
  return rows.map((dto, index) => mapSystemStatusFromApi(dto, index + 1))
}

/** GET /master/menus */
export async function fetchMasterMenus(): Promise<MenuRow[] | null> {
  const payload = await apiClient.get<unknown>('/master/menus')
  const rows = unwrapArray<MasterMenuApiDto>(payload)
  if (!rows) return null
  return mapMenusFromApi(rows)
}

function unwrapSectionRows<K extends MasterKey>(payload: unknown): MasterBundle[K] | null {
  if (Array.isArray(payload)) return payload as MasterBundle[K]
  if (payload && typeof payload === 'object') {
    const data = (payload as { data?: unknown }).data
    if (Array.isArray(data)) return data as MasterBundle[K]
  }
  return null
}

type SectionFetchFn = () => Promise<MasterBundle[MasterKey] | null>

const API_SECTION_FETCH: Partial<Record<MasterKey, SectionFetchFn>> = {
  roles: () => fetchMasterRoles(),
  titles: () => fetchMasterTitles(),
  semesters: () => fetchMasterSemesters(),
  classes: () => fetchMasterClasses(),
  periods: () => fetchMasterPeriods(),
  system_status: () => fetchMasterSystemStatuses(),
  menus: () => fetchMasterMenus(),
}

/** แท็บที่มี GET/PUT จริงบน .NET (ไม่ใช่ /master/bundle/...) */
export function isMasterSectionApiBacked(key: MasterKey): boolean {
  return key in API_SECTION_FETCH
}

export const masterBundleQueryKey = ['master', 'bundle'] as const

export const masterSectionQueryKey = (key: MasterKey) => ['master', 'section', key] as const

/**
 * โหลด master ชุดเริ่มต้น (seed) — ข้อมูลจริงโหลดทีละแท็บผ่าน fetchMasterSection
 * ไม่เรียก GET /master/bundle (backend ใช้ path แยก เช่น /master/roles)
 */
export async function fetchMasterBundle(): Promise<MasterBundle> {
  const bundle = cloneBundle(initialMasterBundle)
  mockStore = cloneBundle(bundle)

  if (hasApiBase()) {
    return bundle
  }

  try {
    const payload = await apiClient.get<unknown>('/master/bundle')
    const parsed = unwrapBundle(payload)
    if (parsed) {
      mockStore = cloneBundle(parsed)
      return parsed
    }
  } catch {
    /* local mock server */
  }

  await delay(120)
  return cloneBundle(mockStore)
}

/**
 * โหลด master หนึ่งกลุ่ม — เรียกเมื่อผู้ใช้เปิดแท็บนั้น
 */
export async function fetchMasterSection<K extends MasterKey>(
  key: K,
): Promise<MasterBundle[K]> {
  if (hasApiBase()) {
    const fetchApi = API_SECTION_FETCH[key]
    if (!fetchApi) {
      return structuredClone(mockStore[key])
    }

    const rows = await fetchApi()
    if (rows === null) {
      throw new Error(`Invalid response for master section: ${key}`)
    }
    const section = structuredClone(rows) as MasterBundle[K]
    mockStore = { ...mockStore, [key]: section }
    return section
  }

  try {
    const payload = await apiClient.get<unknown>(`/master/bundle/${key}`)
    const sectionRows = unwrapSectionRows<K>(payload)
    if (sectionRows) {
      const section = structuredClone(sectionRows)
      mockStore = { ...mockStore, [key]: section }
      return section
    }
  } catch {
    /* local mock */
  }

  await delay(120)
  return structuredClone(mockStore[key])
}

/**
 * บันทึก master ทั้งชุด — PUT /master/bundle (fallback mock)
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

async function saveMasterRolesApi(rows: RoleRow[]): Promise<boolean> {
  const body = rows.map(mapRoleToApi)
  await apiClient.put<unknown, MasterRoleApiDto[]>('/master/roles', body)
  return true
}

async function saveMasterTitlesApi(rows: TitleRow[]): Promise<boolean> {
  const body = rows.map(mapTitleToApi)
  await apiClient.put<unknown, MasterTitleApiDto[]>('/master/titles', body)
  return true
}

async function saveMasterSemestersApi(rows: SemesterRow[]): Promise<boolean> {
  const body = rows.map(mapSemesterToApi)
  await apiClient.put<unknown, MasterSemesterApiDto[]>('/master/semesters', body)
  return true
}

async function saveMasterClassesApi(rows: ClassRow[]): Promise<boolean> {
  const body = rows.map(mapClassToApi)
  await apiClient.put<unknown, MasterClassApiDto[]>('/master/classes', body)
  return true
}

async function saveMasterPeriodsApi(rows: PeriodRow[]): Promise<boolean> {
  const body = rows.map(mapPeriodToApi)
  await apiClient.put<unknown, MasterPeriodApiDto[]>('/master/periods', body)
  return true
}

async function saveMasterSystemStatusesApi(rows: SystemStatusRow[]): Promise<boolean> {
  const body = rows.map(mapSystemStatusToApi)
  await apiClient.put<unknown, MasterSystemStatusApiDto[]>('/master/system-statuses', body)
  return true
}

async function saveMasterMenusApi(rows: MenuRow[]): Promise<boolean> {
  const body = rows.map(mapMenuToApi)
  await apiClient.put<unknown, MasterMenuApiDto[]>('/master/menus', body)
  return true
}

type ApiSaveHandler = (rows: MasterBundle[MasterKey]) => Promise<boolean>

const API_SECTION_SAVE: Partial<Record<MasterKey, ApiSaveHandler>> = {
  roles: (rows) => saveMasterRolesApi(rows as RoleRow[]),
  titles: (rows) => saveMasterTitlesApi(rows as TitleRow[]),
  semesters: (rows) => saveMasterSemestersApi(rows as SemesterRow[]),
  classes: (rows) => saveMasterClassesApi(rows as ClassRow[]),
  periods: (rows) => saveMasterPeriodsApi(rows as PeriodRow[]),
  system_status: (rows) => saveMasterSystemStatusesApi(rows as SystemStatusRow[]),
  menus: (rows) => saveMasterMenusApi(rows as MenuRow[]),
}

/**
 * บันทึก master หนึ่งกลุ่ม (แท็บปัจจุบัน)
 */
export async function saveMasterSection<K extends MasterKey>(
  key: K,
  rows: MasterBundle[K],
): Promise<MasterBundle> {
  if (hasApiBase()) {
    const saveApi = API_SECTION_SAVE[key]
    if (!saveApi) {
      throw new Error(`Master section "${key}" has no PUT API on the server yet`)
    }
    await saveApi(rows)
    mockStore = { ...mockStore, [key]: structuredClone(rows) }
    return cloneBundle(mockStore)
  }

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
    /* local mock */
  }
  await delay(220)
  mockStore = { ...mockStore, [key]: structuredClone(rows) }
  return cloneBundle(mockStore)
}

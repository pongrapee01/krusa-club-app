import type { NavItem, NavSubItem } from '@/config/navigation'
import { mainNavItems } from '@/config/navigation'
import { apiClient } from '@/lib/api/apiClient'

// DTO จาก GET /menus/me
export type MenuItemDto = {
  id: string | number
  code: string
  label: string
  path: string
  icon?: string | null
  menuType?: string | null
  sortOrder?: number | null
  sort_order?: number | null
  subMenus: MenuItemDto[]
}

export type MenuRow = {
  id: string
  parent_id: string | null
  label: string
  path: string
  sort_order: number
  match_end: boolean
}

type NavigationApiResponse =
  | MenuItemDto[]
  | { items: NavItem[] }
  | { rows: MenuRow[] }
  | NavItem[]
  | MenuRow[]

const NAVIGATION_ENDPOINT = '/menus/me'

function asRecord(dto: unknown): Record<string, unknown> {
  return dto !== null && typeof dto === 'object' ? (dto as Record<string, unknown>) : {}
}

/** รองรับ JSON camelCase + PascalCase จาก .NET */
function getSubMenus(dto: MenuItemDto): MenuItemDto[] {
  const r = asRecord(dto)
  const raw = r.subMenus ?? r.SubMenus
  return Array.isArray(raw) ? (raw as MenuItemDto[]) : []
}

function pickIcon(dto: MenuItemDto): string | undefined {
  const r = asRecord(dto)
  const v = r.icon ?? r.Icon
  if (v == null) return undefined
  const s = String(v).trim()
  return s === '' ? undefined : s
}

function pickMenuType(dto: MenuItemDto): string | null | undefined {
  const r = asRecord(dto)
  const v = r.menuType ?? r.MenuType
  return typeof v === 'string' ? v : undefined
}

// ── MenuItemDto mapper ──────────────────────────────────────────────────────

/** แปลง MenuItemDto[] จาก /menus/me เป็น NavItem tree */
export function buildNavItemsFromDtos(dtos: MenuItemDto[]): NavItem[] {
  const topMenus = [...dtos].filter((item) => isTopMenu(pickMenuType(item))).sort(compareDtoOrder)
  return topMenus.map(mapDto)
}

function mapDto(dto: MenuItemDto): NavItem {
  const subs = getSubMenus(dto)
  const sideMenus = [...subs].filter((sub) => isSidebarMenu(pickMenuType(sub))).sort(compareDtoOrder)
  const children: NavSubItem[] = sideMenus.map((sub) => {
    const subSubs = getSubMenus(sub)
    const icon = pickIcon(sub)
    return {
      id: String(sub.id),
      label: sub.label,
      to: sub.path,
      // leaf node (ไม่มี sub-submenu) → exact match
      end: subSubs.length === 0,
      ...(icon ? { icon } : {}),
    }
  })

  const topIcon = pickIcon(dto)

  return {
    id: String(dto.id),
    label: dto.label,
    to: dto.path,
    end: subs.length === 0,
    ...(topIcon ? { icon: topIcon } : {}),
    ...(children.length ? { children } : {}),
  }
}

function isMenuItemDtoArray(value: unknown[]): value is MenuItemDto[] {
  const first = value[0] as Record<string, unknown>
  const hasValidId =
    typeof first.id === 'string' ||
    typeof first.id === 'number' ||
    typeof first.Id === 'string' ||
    typeof first.Id === 'number'
  const code = first.code ?? first.Code
  const subMenus = first.subMenus ?? first.SubMenus
  return hasValidId && typeof code === 'string' && Array.isArray(subMenus)
}

function isTopMenu(menuType: string | null | undefined): boolean {
  if (!menuType) return true
  return menuType.toUpperCase() !== 'SIDEBAR'
}

function isSidebarMenu(menuType: string | null | undefined): boolean {
  if (!menuType) return true
  return menuType.toUpperCase() === 'SIDEBAR'
}

function dtoSortValue(item: MenuItemDto): number {
  const r = asRecord(item)
  const so = item.sortOrder ?? item.sort_order ?? r.SortOrder ?? r.sortOrder
  return typeof so === 'number' ? so : Number.MAX_SAFE_INTEGER
}

function compareDtoOrder(a: MenuItemDto, b: MenuItemDto): number {
  return dtoSortValue(a) - dtoSortValue(b)
}

// ── MenuRow mapper (legacy flat-row format) ─────────────────────────────────

/** แปลงแถว flat จาก DB เป็น tree สำหรับ NavItem */
export function buildNavItemsFromRows(rows: MenuRow[]): NavItem[] {
  const byParent = new Map<string | null, MenuRow[]>()
  for (const r of rows) {
    const k = r.parent_id
    if (!byParent.has(k)) byParent.set(k, [])
    byParent.get(k)!.push(r)
  }
  for (const arr of byParent.values()) {
    arr.sort((a, b) => a.sort_order - b.sort_order)
  }

  const roots = byParent.get(null) ?? []
  return roots.map((r) => mapNode(r, byParent))
}

function mapNode(row: MenuRow, byParent: Map<string | null, MenuRow[]>): NavItem {
  const kids = byParent.get(row.id) ?? []
  const children: NavSubItem[] = kids.map((c) => ({
    id: c.id,
    label: c.label,
    to: c.path,
    end: c.match_end,
  }))

  return {
    id: row.id,
    label: row.label,
    to: row.path,
    end: row.match_end,
    ...(children.length ? { children } : {}),
  }
}

// ── fetchNavTreeForUser ─────────────────────────────────────────────────────

export async function fetchNavTreeForUser(): Promise<NavItem[]> {
  try {
    const data = await apiClient.get<NavigationApiResponse>(NAVIGATION_ENDPOINT)
    return normalizeNavigationResponse(data)
  } catch {
    return mainNavItems
  }
}

function normalizeNavigationResponse(data: NavigationApiResponse): NavItem[] {
  if (Array.isArray(data)) {
    if (!data.length) return mainNavItems
    // .NET MenuItemDto[] — ตรวจจาก id:number + subMenus + code
    if (isMenuItemDtoArray(data)) return buildNavItemsFromDtos(data)
    // legacy NavItem[] หรือ MenuRow[]
    return isNavItemArray(data)
      ? (data as NavItem[])
      : buildNavItemsFromRows(data as MenuRow[])
  }

  if ('items' in data && Array.isArray(data.items) && data.items.length) {
    return data.items
  }

  if ('rows' in data && Array.isArray(data.rows) && data.rows.length) {
    return buildNavItemsFromRows(data.rows)
  }

  return mainNavItems
}

function isNavItemArray(value: unknown[]): value is NavItem[] {
  return value.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      'label' in item &&
      'to' in item,
  )
}


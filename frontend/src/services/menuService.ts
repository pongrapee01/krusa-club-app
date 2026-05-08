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

// ── MenuItemDto mapper ──────────────────────────────────────────────────────

/** แปลง MenuItemDto[] จาก /menus/me เป็น NavItem tree */
export function buildNavItemsFromDtos(dtos: MenuItemDto[]): NavItem[] {
  const topMenus = [...dtos].filter((item) => isTopMenu(item.menuType)).sort(compareDtoOrder)
  return topMenus.map(mapDto)
}

function mapDto(dto: MenuItemDto): NavItem {
  const sideMenus = [...dto.subMenus]
    .filter((sub) => isSidebarMenu(sub.menuType))
    .sort(compareDtoOrder)
  const children: NavSubItem[] = sideMenus.map((sub) => ({
    id: String(sub.id),
    label: sub.label,
    to: sub.path,
    // leaf node (ไม่มี sub-submenu) → exact match
    end: sub.subMenus.length === 0,
  }))

  return {
    id: String(dto.id),
    label: dto.label,
    to: dto.path,
    end: dto.subMenus.length === 0,
    ...(children.length ? { children } : {}),
  }
}

function isMenuItemDtoArray(value: unknown[]): value is MenuItemDto[] {
  const first = value[0] as Record<string, unknown>
  const hasValidId = typeof first.id === 'string' || typeof first.id === 'number'
  return hasValidId && typeof first.code === 'string' && Array.isArray(first.subMenus)
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
  if (typeof item.sortOrder === 'number') return item.sortOrder
  if (typeof item.sort_order === 'number') return item.sort_order
  return Number.MAX_SAFE_INTEGER
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


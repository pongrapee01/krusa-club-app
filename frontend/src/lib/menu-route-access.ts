import type { NavItem } from '@/config/navigation'

type NavPathEntry = { to: string; end?: boolean }

/** path ที่ผู้ไม่ล็อกอินเข้าได้โดยไม่ต้องมีเมนูในระบบ */
export function isGuestPublicPath(pathname: string): boolean {
  if (pathname === '/') return true
  if (pathname === '/register' || pathname === '/login') return true
  if (pathname === '/guide' || pathname.startsWith('/guide/')) return true
  return false
}

function pathMatchesNavEntry(pathname: string, entry: NavPathEntry): boolean {
  const { to, end } = entry
  if (!to) return false
  if (end) return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}

/** ตรวจว่า path ปัจจุบันอยู่ในเมนูที่ผู้ใช้มีสิทธิ์ (จาก /menus/me) */
export function isPathAllowedByMenu(pathname: string, items: NavItem[]): boolean {
  if (pathname === '/') return true

  for (const item of items) {
    if (pathMatchesNavEntry(pathname, item)) return true
    for (const child of item.children ?? []) {
      if (pathMatchesNavEntry(pathname, child)) return true
    }
  }

  return false
}

export function canAccessPath(
  pathname: string,
  options: { userId: string | null; menuItems: NavItem[] },
): boolean {
  if (!options.userId) return isGuestPublicPath(pathname)
  return isPathAllowedByMenu(pathname, options.menuItems)
}

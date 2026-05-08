import type { NavItem } from '@/config/navigation'
import { mainNavItems } from '@/config/navigation'

const DEFAULT_ACTIVE_PATH = '/dashboard'

/** หาเมนูหลักที่มีเมนูย่อยและตรงกับ path ปัจจุบัน */
export function getActiveNavSection(
  pathname: string,
  items: NavItem[] = mainNavItems,
): NavItem | null {
  if (pathname === '/') {
    const defaultSection = items.find(
      (item) => item.to === DEFAULT_ACTIVE_PATH && item.children?.length,
    )
    if (defaultSection) return defaultSection
    return null
  }

  for (const item of items) {
    if (!item.children?.length) continue
    if (pathname === item.to || pathname.startsWith(`${item.to}/`)) return item
    const hit = item.children.some((child) =>
      child.end
        ? pathname === child.to
        : pathname === child.to || pathname.startsWith(`${child.to}/`),
    )
    if (hit) return item
  }
  return null
}

/** ไฮไลต์ปุ่มเมนูบน — รองรับกลุ่มที่มี children */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (pathname === '/') return item.to === DEFAULT_ACTIVE_PATH
  if (item.children?.length) {
    if (pathname === item.to || pathname.startsWith(`${item.to}/`)) return true
    return item.children.some((child) =>
      child.end
        ? pathname === child.to
        : pathname === child.to || pathname.startsWith(`${child.to}/`),
    )
  }
  if (item.end) return pathname === item.to
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

/**
 * เมนูหลัก + เมนูย่อย (คอลัมน์ซ้าย) — เพิ่ม route ใน `router.tsx` ให้ตรงกับ `to`
 *
 * หมายเหตุ: path `/` (Home) ไม่แสดงเมนูย่อยซ้าย — เป็นแลนดิ้งให้ผู้ไม่ล็อกอินใช้งานฟีเจอร์อื่นในเว็บ
 */
export type NavSubItem = {
  id: string
  label: string
  to: string
  end?: boolean
  /** คีย์ icon จาก API (เช่น layout-dashboard, Home) — แมปใน NavMenuIcon */
  icon?: string | null
}

export type NavItem = {
  id: string
  label: string
  to: string
  end?: boolean
  icon?: string | null
  children?: NavSubItem[]
}

export const mainNavItems: NavItem[] = [
  { id: 'home', label: 'Home', to: '/', end: true, icon: 'home' },
  {
    id: 'guide',
    label: 'Guide',
    to: '/guide',
    icon: 'book-open',
    children: [
      { id: 'guide-manual', label: 'คู่มือ', to: '/guide', end: true, icon: 'file-text' },
      { id: 'guide-qa', label: 'Q&A', to: '/guide/qa', icon: 'circle-help' },
    ],
  },
  { id: 'login', label: 'Login', to: '/login', end: true, icon: 'log-in' },
]

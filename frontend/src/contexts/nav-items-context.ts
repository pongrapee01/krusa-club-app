import { createContext } from 'react'

import type { NavItem } from '@/config/navigation'

export type NavItemsContextValue = {
  items: NavItem[]
  source: 'static' | 'remote'
  isLoading: boolean
  userId: string | null
  /** true หลังอ่าน session ครั้งแรกเสร็จ */
  authReady: boolean
}

export const NavItemsContext = createContext<NavItemsContextValue | null>(null)

import { createContext } from 'react'

import type { NavItem } from '@/config/navigation'

export type NavItemsContextValue = {
  items: NavItem[]
  source: 'static' | 'remote'
  isLoading: boolean
}

export const NavItemsContext = createContext<NavItemsContextValue | null>(null)

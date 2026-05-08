import { createContext } from 'react'

import type { NavItem } from '@/config/navigation'

export type AppLayoutContextValue = {
  activeSection: NavItem | null
  hasSubNav: boolean
  sidebarCollapsed: boolean
  toggleSidebarCollapsed: () => void
  mobileSubNavOpen: boolean
  setMobileSubNavOpen: (open: boolean) => void
}

export const AppLayoutContext = createContext<AppLayoutContextValue | null>(null)

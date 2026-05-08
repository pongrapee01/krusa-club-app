import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

import { AppLayoutContext } from '@/contexts/AppLayoutContext'
import { useNavItems } from '@/hooks/useNavItems'
import { getActiveNavSection } from '@/lib/nav-utils'

const STORAGE_KEY = 'krusa-subnav-collapsed'

function readCollapsedFromStorage(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function AppLayoutProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { items: navItems } = useNavItems()
  const activeSection = useMemo(
    () => getActiveNavSection(location.pathname, navItems),
    [location.pathname, navItems],
  )
  const hasSubNav = Boolean(activeSection?.children?.length)

  const [sidebarCollapsed, setSidebarCollapsed] = useState(readCollapsedFromStorage)
  const [mobileSubNavOpen, setMobileSubNavOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, sidebarCollapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed])

  // ปิด drawer เมนูย่อยบนมือถือเมื่อเปลี่ยนหน้า — sync กับ router
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional route transition UI reset
    setMobileSubNavOpen(false)
  }, [location.pathname])

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((c) => !c)
  }, [])

  const value = useMemo(
    () => ({
      activeSection,
      hasSubNav,
      sidebarCollapsed,
      toggleSidebarCollapsed,
      mobileSubNavOpen,
      setMobileSubNavOpen,
    }),
    [
      activeSection,
      hasSubNav,
      sidebarCollapsed,
      toggleSidebarCollapsed,
      mobileSubNavOpen,
    ],
  )

  return (
    <AppLayoutContext.Provider value={value}>{children}</AppLayoutContext.Provider>
  )
}

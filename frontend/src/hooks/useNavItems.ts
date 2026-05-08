import { useContext } from 'react'

import { NavItemsContext } from '@/contexts/nav-items-context'

export function useNavItems() {
  const ctx = useContext(NavItemsContext)
  if (!ctx) {
    throw new Error('useNavItems must be used within NavItemsProvider')
  }
  return ctx
}

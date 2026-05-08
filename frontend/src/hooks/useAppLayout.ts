import { useContext } from 'react'

import { AppLayoutContext } from '@/contexts/AppLayoutContext'

export function useAppLayout() {
  const ctx = useContext(AppLayoutContext)
  if (!ctx) {
    throw new Error('useAppLayout must be used within AppLayoutProvider')
  }
  return ctx
}

import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { mainNavItems } from '@/config/navigation'
import { NavItemsContext } from '@/contexts/nav-items-context'
import { NAV_MENUS_QUERY_KEY } from '@/lib/nav-query-keys'
import { supabase } from '@/lib/supabase/client'
import { fetchNavTreeForUser } from '@/services/menuService'

export function NavItemsProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setUserId(data.session?.user.id ?? null)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null)
    })
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const enabled = Boolean(userId)

  const query = useQuery({
    queryKey: [...NAV_MENUS_QUERY_KEY, userId],
    queryFn: fetchNavTreeForUser,
    enabled,
    staleTime: 60_000,
  })

  const value = useMemo(() => {
    if (!userId) {
      return { items: mainNavItems, source: 'static' as const, isLoading: false }
    }
    if (query.isPending) {
      return { items: mainNavItems, source: 'static' as const, isLoading: true }
    }
    if (query.isSuccess && query.data?.length) {
      return { items: query.data, source: 'remote' as const, isLoading: false }
    }
    return { items: mainNavItems, source: 'static' as const, isLoading: false }
  }, [userId, query.isPending, query.isSuccess, query.data])

  return (
    <NavItemsContext.Provider value={value}>{children}</NavItemsContext.Provider>
  )
}

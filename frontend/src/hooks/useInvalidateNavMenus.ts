import { useQueryClient } from '@tanstack/react-query'

import { NAV_MENUS_QUERY_KEY } from '@/lib/nav-query-keys'

export function useInvalidateNavMenus() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: [...NAV_MENUS_QUERY_KEY] })
}

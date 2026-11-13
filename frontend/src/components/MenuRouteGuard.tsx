import { useEffect, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useNavItems } from '@/hooks/useNavItems'
import { canAccessPath } from '@/lib/menu-route-access'

type MenuRouteGuardProps = {
  children: ReactNode
}

/**
 * กัน deep-link: ถ้า path ไม่อยู่ในเมนูที่ผู้ใช้มีสิทธิ์ (หรือยังไม่ล็อกอิน) → กลับหน้าแรก
 */
export function MenuRouteGuard({ children }: MenuRouteGuardProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { items, isLoading, userId, authReady } = useNavItems()

  const pathname = location.pathname
  const waitingMenu = Boolean(userId) && isLoading
  const allowed =
    authReady && !waitingMenu && canAccessPath(pathname, { userId, menuItems: items })

  useEffect(() => {
    if (!authReady || waitingMenu) return
    if (!canAccessPath(pathname, { userId, menuItems: items })) {
      navigate('/', { replace: true })
    }
  }, [authReady, waitingMenu, pathname, userId, items, navigate])

  if (!authReady || waitingMenu || !allowed) return null

  return children
}

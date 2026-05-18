import { createElement } from 'react'

import { resolveNavMenuLucideIcon } from '@/lib/navMenuLucideIcon'

type NavMenuIconProps = {
  icon?: string | null
  className?: string
}

export function NavMenuIcon({ icon, className }: NavMenuIconProps) {
  const Icon = resolveNavMenuLucideIcon(icon)
  if (!Icon) return null
  return createElement(Icon, { className, 'aria-hidden': true })
}

import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

const tabs = [
  { to: '/config/users/students', label: 'Students', end: false },
  { to: '/config/users/teachers', label: 'Teachers', end: false },
  { to: '/config/users/accounts', label: 'Login Accounts', end: false },
  { to: '/config/users/roles', label: 'Roles & Permissions', end: false },
] as const

const tabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
    isActive
      ? 'bg-orange-600 text-white shadow-sm ring-1 ring-orange-400/50'
      : 'text-white/85 ring-1 ring-white/15 hover:bg-white/10 hover:text-white',
  )

/**
 * เมนูย่อย User Management อยู่ในเนื้อหาหน้าเท่านั้น — ไม่ใช้ SubNavSidebar
 */
export function UserManagementInPageNav() {
  return (
    <nav
      aria-label="User management sections"
      className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-slate-950/40 p-2 shadow-inner shadow-black/20"
    >
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.end} className={tabClass}>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}

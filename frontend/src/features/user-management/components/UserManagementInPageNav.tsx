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
    'inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-5 text-sm font-medium transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 focus-visible:ring-offset-2',
    isActive
      ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-ed-btn-primary hover:from-blue-400'
      : 'text-slate-600 hover:bg-blue-50 hover:text-slate-900',
  )

export function UserManagementInPageNav() {
  return (
    <nav
      aria-label="User management sections"
      className="flex flex-wrap gap-2 rounded-[28px] border border-white/80 bg-white p-2 shadow-ed-card"
    >
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.end} className={tabClass}>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { NavMenuIcon } from '@/components/NavMenuIcon'

import { useAppLayout } from '@/hooks/useAppLayout'
import { cn } from '@/lib/utils'

const subLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex min-h-[44px] items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors touch-manipulation',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 focus-visible:ring-offset-2',
    isActive
      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/15 hover:bg-blue-500'
      : 'text-slate-600 hover:bg-blue-50 hover:text-slate-900',
  )

const subNavChrome =
  'border-slate-200 bg-white/95 backdrop-blur-sm'

const iconBtnClass =
  'inline-flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/35'

export function SubNavSidebar() {
  const {
    activeSection,
    hasSubNav,
    sidebarCollapsed,
    toggleSidebarCollapsed,
    mobileSubNavOpen,
    setMobileSubNavOpen,
  } = useAppLayout()

  if (!hasSubNav || !activeSection?.children?.length) return null

  const items = activeSection.children

  const navList = (
    <ul className="flex flex-col gap-1.5 p-3">
      {items.map((item) => (
        <li key={item.id}>
          <NavLink
            to={item.to}
            end={item.end}
            className={subLinkClass}
            onClick={() => setMobileSubNavOpen(false)}
          >
            <NavMenuIcon icon={item.icon} className="size-4 shrink-0 opacity-90" />
            <span>{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          mobileSubNavOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!mobileSubNavOpen}
      >
        <button
          type="button"
          tabIndex={mobileSubNavOpen ? 0 : -1}
          className={cn(
            'absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] transition-opacity',
            mobileSubNavOpen ? 'opacity-100' : 'opacity-0',
          )}
          aria-label="ปิดเมนูย่อย"
          onClick={() => setMobileSubNavOpen(false)}
        />
        <aside
          className={cn(
            'absolute left-0 top-0 flex h-full w-[min(88vw,288px)] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-out',
            mobileSubNavOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          id="sub-nav-drawer"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-800">{activeSection.label}</p>
            <button
              type="button"
              className={iconBtnClass}
              aria-label="ปิดเมนูย่อย"
              onClick={() => setMobileSubNavOpen(false)}
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
          </div>
          <nav aria-label="เมนูย่อย">{navList}</nav>
        </aside>
      </div>

      <aside
        className={cn(
          'relative hidden shrink-0 border-r transition-[width] duration-200 ease-out lg:flex lg:flex-col',
          subNavChrome,
          sidebarCollapsed ? 'lg:w-14' : 'lg:w-60',
        )}
        aria-label="เมนูย่อย"
      >
        <div className="flex items-center justify-between gap-1 border-b border-slate-200 p-3">
          {!sidebarCollapsed ? (
            <>
              <p className="min-w-0 flex-1 truncate px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {activeSection.label}
              </p>
              <button
                type="button"
                className={iconBtnClass}
                aria-label="ยุบเมนูย่อย"
                onClick={toggleSidebarCollapsed}
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
            </>
          ) : (
            <button
              type="button"
              className={cn(iconBtnClass, 'mx-auto')}
              aria-label="ขยายเมนูย่อย"
              onClick={toggleSidebarCollapsed}
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          )}
        </div>
        {!sidebarCollapsed ? (
          <nav className="flex-1 overflow-y-auto py-1">{navList}</nav>
        ) : null}
      </aside>
    </>
  )
}

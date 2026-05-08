import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useAppLayout } from '@/hooks/useAppLayout'
import { cn } from '@/lib/utils'

const subLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex min-h-[44px] items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors touch-manipulation',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/90',
    isActive
      ? 'bg-orange-600 text-white shadow-sm ring-1 ring-orange-400/50 hover:bg-orange-500'
      : 'text-white/95 hover:bg-orange-400/25 active:bg-orange-600',
  )

const subNavChrome =
  'border-white/15 bg-slate-950/50 backdrop-blur-md shadow-lg shadow-black/25'

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
    <ul className="flex flex-col gap-1 p-2">
      {items.map((item) => (
        <li key={item.id}>
          <NavLink
            to={item.to}
            end={item.end}
            className={subLinkClass}
            onClick={() => setMobileSubNavOpen(false)}
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      {/* Mobile drawer */}
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
            'absolute inset-0 bg-slate-950/55 backdrop-blur-[2px] transition-opacity',
            mobileSubNavOpen ? 'opacity-100' : 'opacity-0',
          )}
          aria-label="ปิดเมนูย่อย"
          onClick={() => setMobileSubNavOpen(false)}
        />
        <aside
          className={cn(
            'absolute left-0 top-0 flex h-full w-[min(88vw,288px)] flex-col border-r shadow-xl transition-transform duration-200 ease-out',
            subNavChrome,
            mobileSubNavOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          id="sub-nav-drawer"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
            <p className="truncate text-sm font-semibold text-white">
              {activeSection.label}
            </p>
            <button
              type="button"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-white ring-1 ring-white/25 transition-colors hover:bg-orange-400/25 active:bg-orange-600 touch-manipulation"
              aria-label="ปิดเมนูย่อย"
              onClick={() => setMobileSubNavOpen(false)}
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
          </div>
          <nav aria-label="เมนูย่อย">{navList}</nav>
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'relative hidden shrink-0 border-r transition-[width] duration-200 ease-out lg:flex lg:flex-col',
          subNavChrome,
          sidebarCollapsed ? 'lg:w-12' : 'lg:w-56',
        )}
        aria-label="เมนูย่อย"
      >
        <div className="flex items-center justify-between gap-1 border-b border-white/10 p-2">
          {!sidebarCollapsed ? (
            <>
              <p className="min-w-0 flex-1 truncate px-2 text-xs font-semibold uppercase tracking-wide text-white/90">
                {activeSection.label}
              </p>
              <button
                type="button"
                className="inline-flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-lg text-white transition-colors hover:bg-orange-400/25 active:bg-orange-600 touch-manipulation"
                aria-label="ยุบเมนูย่อย"
                onClick={toggleSidebarCollapsed}
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="mx-auto inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white transition-colors hover:bg-orange-400/25 active:bg-orange-600 touch-manipulation"
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

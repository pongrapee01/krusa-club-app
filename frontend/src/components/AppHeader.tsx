import { Bell, Menu, PanelLeft, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import { NavMenuIcon } from '@/components/NavMenuIcon'

import { useAppLayout } from '@/hooks/useAppLayout'
import { useNavItems } from '@/hooks/useNavItems'
import { isNavItemActive } from '@/lib/nav-utils'
import { supabase } from '@/lib/supabase/client'
import {
  extractAvatarUrlFromAuthMe,
  extractEmailFromAuthMe,
  fetchAuthMe,
} from '@/services/authService'
import { cn } from '@/lib/utils'
import logo from '@/assets/logo.png'

const iconBtnClass =
  'inline-flex shrink-0 items-center justify-center rounded-xl p-2 text-slate-600 min-h-[44px] min-w-[44px] touch-manipulation border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 focus-visible:ring-offset-2'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200 min-h-[44px] touch-manipulation md:min-h-9',
    'inline-flex items-center justify-center gap-2',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45 focus-visible:ring-offset-2',
    isActive
      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-500'
      : 'text-slate-600 hover:bg-blue-50 hover:text-slate-900',
  )

const navLinkClassMobile = ({ isActive }: { isActive: boolean }) =>
  cn(navLinkClass({ isActive }), 'w-full justify-start')

const LOGIN_PATH = '/login'

const TOPBAR_GUEST_HIDDEN_IDS = new Set(['home', 'guide'])

function emailInitial(email: string) {
  const local = email.trim().split('@')[0] ?? ''
  const ch = local[0] ?? email.trim()[0]
  return ch ? ch.toUpperCase() : '?'
}

export function AppHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuId = useId()
  const { hasSubNav, setMobileSubNavOpen } = useAppLayout()
  const { items: navItems } = useNavItems()
  const centerNavItems = navItems.filter((item) => item.to !== LOGIN_PATH)
  const loginNavItem = navItems.find((item) => item.to === LOGIN_PATH) ?? null
  const [userId, setUserId] = useState<string | null>(null)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [sessionAvatarUrl, setSessionAvatarUrl] = useState<string | null>(null)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountAvatarId = useId()
  const [notificationCount] = useState(0)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUserId(data.session?.user.id ?? null)
      setSessionEmail(data.session?.user.email ?? null)
      const meta = data.session?.user.user_metadata as Record<string, unknown> | undefined
      setSessionAvatarUrl(
        [meta?.avatar_url, meta?.picture, meta?.avatarUrl].find(
          (v): v is string => typeof v === 'string' && v.trim().length > 0,
        ) ?? null,
      )
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null)
      setSessionEmail(session?.user.email ?? null)
      const meta = session?.user.user_metadata as Record<string, unknown> | undefined
      setSessionAvatarUrl(
        [meta?.avatar_url, meta?.picture, meta?.avatarUrl].find(
          (v): v is string => typeof v === 'string' && v.trim().length > 0,
        ) ?? null,
      )
    })
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const authMeQuery = useQuery({
    queryKey: ['auth-me', userId],
    queryFn: fetchAuthMe,
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
  const isAuthenticated = Boolean(userId)

  const centerNavItemsForHeader = centerNavItems.filter(
    (item) => isAuthenticated || !TOPBAR_GUEST_HIDDEN_IDS.has(item.id),
  )

  const loginLabel =
    loginNavItem && authMeQuery.isSuccess
      ? extractEmailFromAuthMe(authMeQuery.data) ?? loginNavItem.label
      : loginNavItem?.label
  const authedEmail = isAuthenticated
    ? authMeQuery.isSuccess
      ? extractEmailFromAuthMe(authMeQuery.data) ?? sessionEmail
      : sessionEmail
    : null

  const profileAvatarUrl = isAuthenticated
    ? authMeQuery.isSuccess
      ? extractAvatarUrlFromAuthMe(authMeQuery.data) ?? sessionAvatarUrl
      : sessionAvatarUrl
    : null

  const handleLogout = async () => {
    setAccountMenuOpen(false)
    await supabase.auth.signOut()
    setMobileOpen(false)
    navigate('/', { replace: true })
  }

  const handleMobileMenuToggle = () => {
    setMobileOpen((prev) => {
      const next = !prev
      if (!next) setAccountMenuOpen(false)
      return next
    })
  }

  const mobileDrawerItems = navItems.filter((item) => {
    if (item.to === LOGIN_PATH) return !isAuthenticated
    if (!isAuthenticated && TOPBAR_GUEST_HIDDEN_IDS.has(item.id)) return false
    return true
  })

  useEffect(() => {
    if (!mobileOpen && !accountMenuOpen) return
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setAccountMenuOpen(false)
      if (mobileOpen) setMobileOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, accountMenuOpen])

  useEffect(() => {
    if (!accountMenuOpen) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target
      if (!(t instanceof globalThis.Node)) return
      if (t instanceof globalThis.Element && t.closest('[data-account-menu-root]')) return
      setAccountMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [accountMenuOpen])

  return (
    <header className="sticky top-0 z-50 w-full shrink-0 border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur-md">
      <div className="flex min-h-14 min-w-0 items-center gap-3 px-4 py-2 sm:min-h-[3.75rem] sm:px-6">
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          {hasSubNav ? (
            <button
              type="button"
              className={cn(iconBtnClass, 'lg:hidden')}
              aria-label="เปิดเมนูย่อย"
              aria-controls="sub-nav-drawer"
              onClick={() => setMobileSubNavOpen(true)}
            >
              <PanelLeft className="size-5" aria-hidden />
            </button>
          ) : null}

          <Link
            to="/"
            className="flex h-11 shrink-0 items-center justify-start transition-opacity hover:opacity-90 sm:h-12 md:h-[3.25rem]"
            aria-label="Krusa Club — หน้าแรก"
          >
            <img
              src={logo}
              alt="Krusa Club"
              className="block h-full w-auto max-w-[min(100%,11rem)] object-contain object-left sm:max-w-[13.5rem] md:max-w-[16rem] lg:max-w-[18rem]"
            />
          </Link>
        </div>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-2 text-sm md:flex"
          aria-label="เมนูหลัก"
        >
          {centerNavItemsForHeader.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.end}
              className={() =>
                navLinkClass({
                  isActive: isNavItemActive(item, location.pathname),
                })
              }
            >
              <NavMenuIcon icon={item.icon} className="size-4 shrink-0 opacity-90" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 md:ml-0">
          {isAuthenticated ? (
            <button
              type="button"
              aria-label="การแจ้งเตือน"
              className="relative inline-flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40"
            >
              <Bell className="size-5" aria-hidden />
              {notificationCount > 0 && (
                <span
                  aria-label={`${notificationCount} การแจ้งเตือนที่ยังไม่อ่าน`}
                  className="absolute right-2.5 top-2.5 flex size-2 rounded-full bg-amber-400 ring-2 ring-white"
                />
              )}
            </button>
          ) : null}

          {isAuthenticated ? (
            <div className="relative hidden md:block" data-account-menu-root>
              <button
                type="button"
                id={`${accountAvatarId}-desktop-trigger`}
                aria-label="เมนูบัญชีผู้ใช้"
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                aria-controls={`${accountAvatarId}-desktop-menu`}
                onClick={() => setAccountMenuOpen((o) => !o)}
                className="size-10 shrink-0 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100 shadow-sm transition hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45"
              >
                {profileAvatarUrl ? (
                  <img
                    src={profileAvatarUrl}
                    alt=""
                    className="size-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-[0.7rem] font-semibold uppercase text-slate-600">
                    {emailInitial(authedEmail ?? 'user')}
                  </span>
                )}
              </button>
              {accountMenuOpen ? (
                <div
                  id={`${accountAvatarId}-desktop-menu`}
                  role="menu"
                  aria-labelledby={`${accountAvatarId}-desktop-trigger`}
                  className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                >
                  <p className="truncate px-4 py-2.5 text-xs text-slate-500" role="presentation">
                    {authedEmail ?? 'Signed in'}
                  </p>
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    onClick={() => {
                      setAccountMenuOpen(false)
                      void handleLogout()
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {loginNavItem && !isAuthenticated ? (
            <NavLink
              to={loginNavItem.to}
              end={loginNavItem.end}
              className={() =>
                cn(
                  navLinkClass({
                    isActive: isNavItemActive(loginNavItem, location.pathname),
                  }),
                  'hidden md:inline-flex',
                )
              }
            >
              <NavMenuIcon icon={loginNavItem.icon} className="size-4 shrink-0 opacity-90" />
              <span>{loginLabel}</span>
            </NavLink>
          ) : null}

          <button
            type="button"
            className={cn(iconBtnClass, 'md:hidden')}
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            aria-label={mobileOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            onClick={handleMobileMenuToggle}
          >
            {mobileOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          id={menuId}
          className="flex flex-col gap-2 border-t border-slate-200 bg-white/95 px-4 py-3 md:hidden"
          aria-label="เมนูหลัก"
        >
          {mobileDrawerItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.end}
              className={() =>
                navLinkClassMobile({
                  isActive: isNavItemActive(item, location.pathname),
                })
              }
              onClick={() => setMobileOpen(false)}
            >
              <NavMenuIcon icon={item.icon} className="size-4 shrink-0 opacity-90" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          {isAuthenticated ? (
            <div className="mt-2 border-t border-slate-200 pt-3 md:hidden" data-account-menu-root>
              <button
                type="button"
                id={`${accountAvatarId}-mobile-trigger`}
                aria-label="เมนูบัญชีผู้ใช้"
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                aria-controls={`${accountAvatarId}-mobile-menu`}
                onClick={() => setAccountMenuOpen((o) => !o)}
                className="size-11 shrink-0 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100 shadow-sm"
              >
                {profileAvatarUrl ? (
                  <img
                    src={profileAvatarUrl}
                    alt=""
                    className="size-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-sm font-semibold uppercase text-slate-600">
                    {emailInitial(authedEmail ?? 'user')}
                  </span>
                )}
              </button>
              {accountMenuOpen ? (
                <div
                  id={`${accountAvatarId}-mobile-menu`}
                  role="menu"
                  aria-labelledby={`${accountAvatarId}-mobile-trigger`}
                  className="mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-sm"
                >
                  <p className="break-all px-4 py-2 text-xs text-slate-500" role="presentation">
                    {authedEmail ?? 'Signed in'}
                  </p>
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    onClick={() => {
                      setAccountMenuOpen(false)
                      void handleLogout()
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>
      ) : null}
    </header>
  )
}

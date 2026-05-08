import { Bell, Menu, PanelLeft, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

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
  'inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-white min-h-[44px] min-w-[44px] touch-manipulation ring-1 ring-white/25 transition-colors hover:bg-orange-400/25 active:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/80'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 min-h-[44px] touch-manipulation md:min-h-9 md:px-3 md:py-1.5',
    'inline-flex items-center justify-center md:justify-center',
    'text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/80',
    isActive
      ? 'bg-orange-600 text-white shadow-md shadow-orange-950/40 ring-1 ring-orange-400/60 hover:bg-orange-500'
      : 'ring-1 ring-transparent hover:bg-orange-400/25 active:bg-orange-600',
  )

const navLinkClassMobile = ({ isActive }: { isActive: boolean }) =>
  cn(
    navLinkClass({ isActive }),
    'w-full justify-start',
    !isActive && 'ring-white/15',
  )

const LOGIN_PATH = '/login'

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
  // TODO: wire ค่า notificationCount จาก API จริงเมื่อพร้อม
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

  const mobileDrawerItems = isAuthenticated
    ? navItems.filter((item) => item.to !== LOGIN_PATH)
    : navItems

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
    <header className="sticky top-0 z-50 w-full shrink-0 border-b border-white/15 bg-slate-950/55 shadow-md shadow-black/20 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2">
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          {hasSubNav ? (
            <button
              type="button"
              className={cn(iconBtnClass, 'lg:hidden')}
              aria-label="เปิดเมนูย่อย"
              aria-controls="sub-nav-drawer"
              onClick={() => setMobileSubNavOpen(true)}
            >
              <PanelLeft className="size-6" aria-hidden />
            </button>
          ) : null}

          <Link
            to="/"
            className="flex min-h-0 min-w-0 max-w-[min(100%,12rem)] items-center justify-start py-0 transition-opacity hover:opacity-95 sm:max-w-[14rem] md:max-w-[16rem]"
            aria-label="Krusa Club — หน้าแรก"
          >
            <img
              src={logo}
              alt="Krusa Club"
              className="block h-9 w-full max-h-10 origin-left object-contain object-left drop-shadow-lg drop-shadow-black/40 sm:h-10 sm:max-h-11 md:h-11 md:max-h-12"
            />
          </Link>
        </div>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-2 text-sm md:flex"
          aria-label="เมนูหลัก"
        >
          {centerNavItems.map((item) => (
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
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 md:ml-0">
          {/* ── Notification bell — หน้าสุด แสดงเฉพาะเมื่อ login ── */}
          {isAuthenticated ? (
            <button
              type="button"
              aria-label="การแจ้งเตือน"
              className="relative inline-flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/80"
            >
              <Bell className="size-5" aria-hidden />
              {notificationCount > 0 && (
                <span
                  aria-label={`${notificationCount} การแจ้งเตือนที่ยังไม่อ่าน`}
                  className="absolute right-2 top-2 flex size-2 rounded-full bg-orange-400 ring-1 ring-slate-950"
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
                className="size-10 shrink-0 overflow-hidden rounded-full border border-white/25 bg-slate-800/90 shadow-md transition hover:border-orange-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/80"
              >
                {profileAvatarUrl ? (
                  <img
                    src={profileAvatarUrl}
                    alt=""
                    className="size-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-[0.7rem] font-semibold uppercase text-white/95">
                    {emailInitial(authedEmail ?? 'user')}
                  </span>
                )}
              </button>
              {accountMenuOpen ? (
                <div
                  id={`${accountAvatarId}-desktop-menu`}
                  role="menu"
                  aria-labelledby={`${accountAvatarId}-desktop-trigger`}
                  className="absolute right-0 z-50 mt-1.5 w-56 rounded-xl border border-white/15 bg-slate-950/95 py-1 shadow-lg shadow-black/40 backdrop-blur-md"
                >
                  <p className="truncate px-3 py-2 text-xs text-white/75" role="presentation">
                    {authedEmail ?? 'Signed in'}
                  </p>
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full px-3 py-2 text-left text-sm text-white transition hover:bg-white/10"
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
              {loginLabel}
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
            {mobileOpen ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          id={menuId}
          className="flex flex-col gap-1 border-t border-white/10 bg-slate-950/50 px-3 py-2 sm:px-4 md:hidden"
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
              {item.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <div className="mt-2 border-t border-white/10 pt-3 md:hidden" data-account-menu-root>
              <button
                type="button"
                id={`${accountAvatarId}-mobile-trigger`}
                aria-label="เมนูบัญชีผู้ใช้"
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                aria-controls={`${accountAvatarId}-mobile-menu`}
                onClick={() => setAccountMenuOpen((o) => !o)}
                className="size-11 shrink-0 overflow-hidden rounded-full border border-white/25 bg-slate-800/90 shadow-md transition hover:border-orange-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/80"
              >
                {profileAvatarUrl ? (
                  <img
                    src={profileAvatarUrl}
                    alt=""
                    className="size-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-sm font-semibold uppercase text-white/95">
                    {emailInitial(authedEmail ?? 'user')}
                  </span>
                )}
              </button>
              {accountMenuOpen ? (
                <div
                  id={`${accountAvatarId}-mobile-menu`}
                  role="menu"
                  aria-labelledby={`${accountAvatarId}-mobile-trigger`}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/90 py-1 shadow-md shadow-black/30 backdrop-blur-md"
                >
                  <p className="break-all px-3 py-2 text-xs text-white/75" role="presentation">
                    {authedEmail ?? 'Signed in'}
                  </p>
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full px-3 py-2.5 text-left text-sm text-white transition hover:bg-white/10"
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

import { Outlet, useLocation } from 'react-router-dom'

import { AppHeader } from '@/components/AppHeader'
import { AppFooter } from '@/components/AppFooter'
import { GlobalLoadingIndicator } from '@/components/GlobalLoadingIndicator'
import { SubNavSidebar } from '@/components/SubNavSidebar'
import { AppLayoutProvider } from '@/contexts/AppLayoutProvider'
import { NavItemsProvider } from '@/contexts/NavItemsProvider'

function LayoutShell() {
  const location = useLocation()

  return (
    <div className="flex min-h-dvh min-h-[100dvh] flex-col font-sans text-white">
      <GlobalLoadingIndicator />
      <AppHeader key={location.pathname} />

      <div className="flex min-h-0 min-w-0 flex-1">
        <SubNavSidebar />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-3 py-5 sm:px-5 sm:py-8">
          <div className="mx-auto w-full max-w-screen-2xl">
            <Outlet />
          </div>
        </main>
      </div>

      <AppFooter />
    </div>
  )
}

export function RootLayout() {
  return (
    <NavItemsProvider>
      <AppLayoutProvider>
        <LayoutShell />
      </AppLayoutProvider>
    </NavItemsProvider>
  )
}

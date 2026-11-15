import { useEffect, useRef, type ReactNode } from 'react'

import { getSection, MASTER_SECTION_ORDER } from '@/features/config-master/config/sections'
import type { MasterKey } from '@/features/config-master/types'
import { ed } from '@/lib/edtech-ui'
import { cn } from '@/lib/utils'

type MasterSectionTabsProps = {
  activeKey: MasterKey
  onChange: (key: MasterKey) => void
  isSectionDirty: (key: MasterKey) => boolean
  children: ReactNode
}

export function MasterSectionTabs({
  activeKey,
  onChange,
  isSectionDirty,
  children,
}: MasterSectionTabsProps) {
  const activePanelId = `master-tabpanel-${activeKey}`
  const tablistRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tab = document.getElementById(`master-tab-${activeKey}`)
    if (!tab || !tablistRef.current) return
    tab.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }, [activeKey])

  return (
    <div className={cn(ed.surface, 'overflow-hidden p-0')}>
      <div className="relative border-b border-slate-200 bg-slate-50/60">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-10 bg-gradient-to-l from-white via-white/90 to-transparent md:block"
          aria-hidden
        />
        <div
          role="tablist"
          aria-label="กลุ่ม Master Data"
          ref={tablistRef}
          className={cn(
            'flex gap-2 p-2',
            'flex-wrap',
            'md:flex-nowrap md:gap-0 md:overflow-x-auto md:p-0 md:scroll-smooth',
            'md:[scrollbar-width:thin] md:[&::-webkit-scrollbar]:h-1.5',
            'md:[&::-webkit-scrollbar-thumb]:rounded-full md:[&::-webkit-scrollbar-thumb]:bg-slate-300',
            'md:[&::-webkit-scrollbar-track]:bg-transparent',
            'md:pr-8 md:pl-1',
          )}
        >
          {MASTER_SECTION_ORDER.map((key) => {
            const isActive = activeKey === key
            const tabId = `master-tab-${key}`
            const dirty = isSectionDirty(key)
            return (
              <button
                key={key}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={isActive ? activePanelId : undefined}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onChange(key)}
                className={cn(
                  'relative shrink-0 text-sm font-medium transition-colors',
                  'focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50',
                  'max-md:rounded-full max-md:shadow-ed-raised max-md:border max-md:px-3 max-md:py-2',
                  isActive
                    ? 'max-md:border-blue-200 max-md:bg-blue-50 max-md:text-blue-700'
                    : 'max-md:border-slate-200 max-md:bg-white max-md:text-slate-600 max-md:hover:border-slate-300 max-md:hover:bg-slate-50',
                  'md:border-b-2 md:px-4 md:py-3',
                  isActive
                    ? 'md:-mb-px md:border-b-blue-600 md:bg-white md:text-blue-700'
                    : 'md:border-b-transparent md:text-slate-500 md:hover:border-b-slate-200 md:hover:bg-slate-50/80 md:hover:text-slate-700',
                )}
              >
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  {getSection(key).label}
                  {dirty ? (
                    <span
                      className="size-2 shrink-0 rounded-full bg-amber-400 ring-2 ring-white"
                      aria-label="มีการแก้ไข"
                    />
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div
        id={activePanelId}
        role="tabpanel"
        aria-labelledby={`master-tab-${activeKey}`}
        className="p-4 sm:p-6"
      >
        {children}
      </div>
    </div>
  )
}

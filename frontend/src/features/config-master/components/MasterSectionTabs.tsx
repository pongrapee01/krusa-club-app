import { useEffect, useRef, type ReactNode } from 'react'

import { getSection, MASTER_SECTION_ORDER } from '@/features/config-master/config/sections'
import type { MasterKey } from '@/features/config-master/types'
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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/30 shadow-lg shadow-black/20">
      <div className="relative border-b border-white/10 bg-slate-950/55">
        {/* บอกให้เลื่อนได้บนจอแคบ (แท็บเป็นแถวเดียว) */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-10 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent md:block"
          aria-hidden
        />
        <div
          role="tablist"
          aria-label="กลุ่ม Master Data"
          ref={tablistRef}
          className={cn(
            'flex gap-1.5 p-2',
            /* mobile / tablet แคบ: แสดงครบทุกแท็บแบบ wrap */
            'flex-wrap',
            /* md+: แถบแท็บแนวนอน เลื่อนดูแท็บท้ายได้ */
            'md:flex-nowrap md:gap-0 md:overflow-x-auto md:p-0 md:scroll-smooth',
            'md:[scrollbar-width:thin] md:[&::-webkit-scrollbar]:h-1.5',
            'md:[&::-webkit-scrollbar-thumb]:rounded-full md:[&::-webkit-scrollbar-thumb]:bg-white/25',
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
                  'focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70',
                  /* mobile / tablet แคบ: chip ในกริด wrap */
                  'max-md:rounded-lg max-md:border max-md:px-3 max-md:py-2',
                  isActive
                    ? 'max-md:border-orange-500/55 max-md:bg-orange-600/25 max-md:text-white'
                    : 'max-md:border-white/15 max-md:bg-slate-900/50 max-md:text-white/75 max-md:hover:border-white/25 max-md:hover:text-white',
                  /* md+: underline tab */
                  'md:border-b-2 md:px-4 md:py-3',
                  isActive
                    ? 'md:-mb-px md:border-b-orange-500 md:bg-slate-950/25 md:text-white'
                    : 'md:border-b-transparent md:text-white/60 md:hover:border-b-white/20 md:hover:bg-white/[0.04] md:hover:text-white/90',
                )}
              >
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  {getSection(key).label}
                  {dirty ? (
                    <span
                      className="size-2 shrink-0 rounded-full bg-amber-400 ring-2 ring-slate-950/80"
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
        className="p-4 sm:p-5"
      >
        {children}
      </div>
    </div>
  )
}

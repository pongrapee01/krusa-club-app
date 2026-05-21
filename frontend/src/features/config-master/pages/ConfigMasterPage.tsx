import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Database } from 'lucide-react'
import { useState } from 'react'

import { getSection } from '@/features/config-master/config/sections'
import { MasterEntityPanel } from '@/features/config-master/components/MasterEntityPanel'
import { MasterSectionTabs } from '@/features/config-master/components/MasterSectionTabs'
import { MasterSaveToolbar } from '@/features/config-master/components/MasterSaveToolbar'
import { getSectionRows, isSectionDirty } from '@/features/config-master/lib/sectionDraft'
import type { MasterBundle, MasterKey } from '@/features/config-master/types'
import { fetchMasterBundle, saveMasterSection } from '@/services/masterDataService'

const MASTER_QUERY_KEY = ['master', 'bundle'] as const

export function ConfigMasterPage() {
  const queryClient = useQueryClient()
  const [activeKey, setActiveKey] = useState<MasterKey>('system_status')
  const [sectionDrafts, setSectionDrafts] = useState<
    Partial<Record<MasterKey, MasterBundle[MasterKey]>>
  >({})
  const [saveMessage, setSaveMessage] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)

  const query = useQuery({
    queryKey: MASTER_QUERY_KEY,
    queryFn: fetchMasterBundle,
  })

  const serverBundle = query.data ?? null
  const activeSection = getSection(activeKey)
  const activeRows =
    serverBundle && getSectionRows(activeKey, serverBundle, sectionDrafts)
  const activeDraft = sectionDrafts[activeKey]
  const isActiveDirty = isSectionDirty(activeKey, activeDraft, serverBundle)

  const saveMutation = useMutation({
    mutationFn: ({ key, rows }: { key: MasterKey; rows: MasterBundle[MasterKey] }) =>
      saveMasterSection(key, rows),
    onSuccess: (data, { key }) => {
      void queryClient.setQueryData(MASTER_QUERY_KEY, data)
      setSectionDrafts((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      setSaveMessage({
        tone: 'ok',
        text: `บันทึก${getSection(key).label}สำเร็จ`,
      })
    },
    onError: (_, { key }) => {
      setSaveMessage({
        tone: 'err',
        text: `บันทึก${getSection(key).label}ไม่สำเร็จ — ลองใหม่หรือตรวจ API /master/bundle/${key}`,
      })
    },
  })

  const setSectionRows = (key: MasterKey, rows: MasterBundle[MasterKey]) => {
    setSectionDrafts((prev) => ({ ...prev, [key]: rows }))
    if (key === activeKey) setSaveMessage(null)
  }

  const handleDiscard = () => {
    setSectionDrafts((prev) => {
      const next = { ...prev }
      delete next[activeKey]
      return next
    })
    setSaveMessage(null)
  }

  const handleSaveSection = () => {
    if (!activeRows || !isActiveDirty) return
    saveMutation.mutate({ key: activeKey, rows: activeRows })
  }

  const handleTabChange = (key: MasterKey) => {
    setActiveKey(key)
    setSaveMessage(null)
  }

  if (query.isPending && !serverBundle) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center text-sm text-white/70">
        กำลังโหลด Master Data…
      </section>
    )
  }

  if (query.isError && !serverBundle) {
    return (
      <section className="space-y-3 rounded-2xl border border-rose-400/30 bg-rose-950/30 p-6 text-white">
        <h1 className="text-xl font-semibold">โหลด Master ไม่สำเร็จ</h1>
        <p className="text-sm text-white/80">ลองรีเฟรชหน้าหรือตรวจ API</p>
      </section>
    )
  }

  if (!serverBundle || !activeRows) return null

  return (
    <section className="space-y-5 pb-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-orange-500/15 ring-1 ring-orange-400/35">
            <Database className="size-6 text-orange-200" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Master and Data
            </h1>
          </div>
        </div>
      </header>

      <MasterSectionTabs
        activeKey={activeKey}
        onChange={handleTabChange}
        isSectionDirty={(key) => isSectionDirty(key, sectionDrafts[key], serverBundle)}
      >
        <MasterEntityPanel
          key={activeKey}
          sectionKey={activeKey}
          rows={activeRows}
          onRowsChange={(rows) => setSectionRows(activeKey, rows)}
        />
        <MasterSaveToolbar
          sectionLabel={activeSection.label}
          isDirty={isActiveDirty}
          saving={saveMutation.isPending}
          saveMessage={saveMessage}
          onSaveSection={handleSaveSection}
          onDiscard={handleDiscard}
        />
      </MasterSectionTabs>
    </section>
  )
}

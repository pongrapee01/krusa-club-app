import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Database } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { getSection } from '@/features/config-master/config/sections'
import { ed } from '@/lib/edtech-ui'
import { MasterEntityPanel } from '@/features/config-master/components/MasterEntityPanel'
import { MasterSectionTabs } from '@/features/config-master/components/MasterSectionTabs'
import { MasterSaveToolbar } from '@/features/config-master/components/MasterSaveToolbar'
import { getSectionRows, isSectionDirty } from '@/features/config-master/lib/sectionDraft'
import type { MasterBundle, MasterKey } from '@/features/config-master/types'
import { env } from '@/lib/env'
import {
  fetchMasterBundle,
  fetchMasterSection,
  isMasterSectionApiBacked,
  masterBundleQueryKey,
  masterSectionQueryKey,
  saveMasterSection,
} from '@/services/masterDataService'

const hasApiBase = Boolean(env.VITE_API_BASE_URL?.trim())

export function ConfigMasterPage() {
  const queryClient = useQueryClient()
  const [activeKey, setActiveKey] = useState<MasterKey>('system_status')
  const [sectionDrafts, setSectionDrafts] = useState<
    Partial<Record<MasterKey, MasterBundle[MasterKey]>>
  >({})
  const [saveMessage, setSaveMessage] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)

  const bundleQuery = useQuery({
    queryKey: masterBundleQueryKey,
    queryFn: fetchMasterBundle,
  })

  const sectionQuery = useQuery({
    queryKey: masterSectionQueryKey(activeKey),
    queryFn: () => fetchMasterSection(activeKey),
    enabled: bundleQuery.isSuccess,
    staleTime: Number.POSITIVE_INFINITY,
  })

  useEffect(() => {
    if (!sectionQuery.data || !bundleQuery.data) return
    queryClient.setQueryData<MasterBundle>(masterBundleQueryKey, (prev) => {
      if (!prev) return prev
      if (prev[activeKey] === sectionQuery.data) return prev
      return { ...prev, [activeKey]: sectionQuery.data }
    })
  }, [activeKey, bundleQuery.data, queryClient, sectionQuery.data])

  const serverBundle = useMemo((): MasterBundle | null => {
    const base = bundleQuery.data
    if (!base) return null
    if (sectionQuery.data) return { ...base, [activeKey]: sectionQuery.data }
    return base
  }, [activeKey, bundleQuery.data, sectionQuery.data])

  const activeSection = getSection(activeKey)
  const activeApiBacked = isMasterSectionApiBacked(activeKey)
  const activeRows =
    serverBundle && getSectionRows(activeKey, serverBundle, sectionDrafts)
  const activeDraft = sectionDrafts[activeKey]
  const isActiveDirty = isSectionDirty(activeKey, activeDraft, serverBundle)
  const canSaveToApi = !hasApiBase || activeApiBacked

  const saveMutation = useMutation({
    mutationFn: ({ key, rows }: { key: MasterKey; rows: MasterBundle[MasterKey] }) =>
      saveMasterSection(key, rows),
    onSuccess: (data, { key }) => {
      void queryClient.setQueryData(masterBundleQueryKey, data)
      void queryClient.setQueryData(masterSectionQueryKey(key), data[key])
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
        text: `บันทึก${getSection(key).label}ไม่สำเร็จ — ลองใหม่หรือตรวจ API`,
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
    if (!activeRows || !isActiveDirty || !canSaveToApi) return
    saveMutation.mutate({ key: activeKey, rows: activeRows })
  }

  const handleTabChange = (key: MasterKey) => {
    setActiveKey(key)
    setSaveMessage(null)
  }

  const sectionLoading = sectionQuery.isPending && !sectionQuery.data
  const sectionLoadFailed = sectionQuery.isError && !sectionQuery.data

  if (bundleQuery.isPending) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        กำลังเตรียมหน้า Master Data…
      </section>
    )
  }

  if (bundleQuery.isError) {
    return (
      <section className="space-y-3 rounded-[28px] border border-rose-200 bg-rose-50 p-6">
        <h1 className="text-xl font-semibold text-slate-900">เปิดหน้า Master ไม่สำเร็จ</h1>
        <p className="text-sm text-slate-600">ลองรีเฟรชหน้าหรือตรวจการเชื่อมต่อ</p>
      </section>
    )
  }

  if (!serverBundle) return null

  return (
    <section className="space-y-6 pb-8">
      <header className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-blue-50 shadow-ed-raised ring-1 ring-blue-100">
            <Database className="size-6 text-blue-600" aria-hidden />
          </div>
          <div>
            <h1 className={ed.pageTitle}>ตั้งค่าข้อมูลระบบ</h1>
          </div>
        </div>
      </header>

      <MasterSectionTabs
        activeKey={activeKey}
        onChange={handleTabChange}
        isSectionDirty={(key) => isSectionDirty(key, sectionDrafts[key], serverBundle)}
      >
        {sectionLoading ? (
          <div className="flex min-h-[240px] items-center justify-center text-sm text-slate-500">
            กำลังโหลด{activeSection.label}…
          </div>
        ) : sectionLoadFailed ? (
          <div className="space-y-3 rounded-3xl border border-rose-200 bg-rose-50 p-5">
            <p className="text-sm font-medium text-slate-900">
              โหลด{activeSection.label}ไม่สำเร็จ
            </p>
            <p className="text-sm text-slate-600">ลองสลับแท็บอื่นแล้วกลับมา หรือรีเฟรชหน้า</p>
            <button
              type="button"
              className={ed.btnSecondary}
              onClick={() => void sectionQuery.refetch()}
            >
              ลองโหลดอีกครั้ง
            </button>
          </div>
        ) : activeRows ? (
          <>
            {hasApiBase && !activeApiBacked ? (
              <p className="mb-4 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                แท็บนี้ยังไม่มี endpoint บนเซิร์ฟเวอร์ — แสดงข้อมูลตัวอย่างในเครื่องเท่านั้น (จะไม่เรียก{' '}
                <code className="text-xs">/master/bundle/…</code>)
              </p>
            ) : null}
            <MasterEntityPanel
              key={activeKey}
              sectionKey={activeKey}
              rows={activeRows}
              onRowsChange={(rows) => setSectionRows(activeKey, rows)}
            />
            <MasterSaveToolbar
              sectionLabel={activeSection.label}
              isDirty={isActiveDirty && canSaveToApi}
              saving={saveMutation.isPending}
              saveMessage={saveMessage}
              onSaveSection={handleSaveSection}
              onDiscard={handleDiscard}
            />
          </>
        ) : null}
      </MasterSectionTabs>
    </section>
  )
}

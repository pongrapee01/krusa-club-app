import { Loader2, RotateCcw, Save } from 'lucide-react'

import { cn } from '@/lib/utils'

type MasterSaveToolbarProps = {
  sectionLabel: string
  isDirty: boolean
  saving: boolean
  saveMessage: { tone: 'ok' | 'err'; text: string } | null
  onSaveSection: () => void
  onDiscard: () => void
}

export function MasterSaveToolbar({
  sectionLabel,
  isDirty,
  saving,
  saveMessage,
  onSaveSection,
  onDiscard,
}: MasterSaveToolbarProps) {
  return (
    <div
      className={cn(
        'mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between',
      )}
    >
      <div className="min-w-0 text-sm text-white/75">
        {isDirty ? (
          <span>
            มีการแก้ไขใน <strong className="text-orange-200">{sectionLabel}</strong> — กด
            &quot;บันทึกทั้งหมด&quot; เพื่อส่งกลุ่มนี้ขึ้นระบบ
          </span>
        ) : (
          <span className="text-white/55">
            ไม่มีการเปลี่ยนแปลงใน {sectionLabel} ที่ยังไม่ได้บันทึก
          </span>
        )}
        {saveMessage ? (
          <p
            className={cn(
              'mt-1 text-xs',
              saveMessage.tone === 'ok' ? 'text-emerald-300' : 'text-rose-300',
            )}
            role="status"
          >
            {saveMessage.text}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          disabled={!isDirty || saving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-white ring-1 ring-white/20 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
          onClick={onDiscard}
        >
          <RotateCcw className="size-4" aria-hidden />
          ยกเลิกการแก้ไข
        </button>
        <button
          type="button"
          disabled={!isDirty || saving}
          className="inline-flex h-11 min-w-[11rem] items-center justify-center gap-2 rounded-full border border-orange-400/50 bg-orange-600 px-5 text-sm font-semibold text-white shadow-md shadow-orange-950/35 ring-1 ring-orange-400/45 transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-45"
          onClick={onSaveSection}
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          บันทึกทั้งหมด
        </button>
      </div>
    </div>
  )
}

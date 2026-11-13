import { Loader2, RotateCcw, Save } from 'lucide-react'

import { ed } from '@/lib/edtech-ui'
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
        'mt-6 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between',
      )}
    >
      <div className="min-w-0 text-sm text-slate-600">
        {isDirty ? (
          <span>
            มีการแก้ไขใน <strong className="text-blue-700">{sectionLabel}</strong> — กด
            &quot;บันทึกทั้งหมด&quot; เพื่อส่งกลุ่มนี้ขึ้นระบบ
          </span>
        ) : (
          <span className="text-slate-500">
            ไม่มีการเปลี่ยนแปลงใน {sectionLabel} ที่ยังไม่ได้บันทึก
          </span>
        )}
        {saveMessage ? (
          <p
            className={cn(
              'mt-1 text-xs',
              saveMessage.tone === 'ok' ? 'text-emerald-600' : 'text-rose-600',
            )}
            role="status"
          >
            {saveMessage.text}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap gap-3">
        <button
          type="button"
          disabled={!isDirty || saving}
          className={cn(ed.btnSecondary, 'h-11 disabled:cursor-not-allowed disabled:opacity-45')}
          onClick={onDiscard}
        >
          <RotateCcw className="size-4" aria-hidden />
          ยกเลิกการแก้ไข
        </button>
        <button
          type="button"
          disabled={!isDirty || saving}
          className={cn(
            ed.btnPrimary,
            'h-11 min-w-[11rem] disabled:cursor-not-allowed disabled:opacity-45',
          )}
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

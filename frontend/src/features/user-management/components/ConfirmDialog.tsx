import { useEffect, useId, type ReactNode } from 'react'

import { ed } from '@/lib/edtech-ui'
import { cn } from '@/lib/utils'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  tone = 'default',
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  const confirmClass =
    tone === 'danger'
      ? 'bg-rose-600 text-white shadow-sm hover:bg-rose-500 focus-visible:ring-rose-400/40'
      : 'bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:ring-blue-400/40'

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain" role="presentation">
      <button
        type="button"
        aria-label="ปิดกล่องโต้ตอบ"
        className="fixed inset-0 cursor-default bg-slate-900/25 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md items-center px-4 py-8"
      >
        <div className={cn(ed.surface, 'w-full p-6')}>
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
          {children ? <div className="mt-4">{children}</div> : null}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onCancel} className={ed.btnSecondary}>
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={cn(ed.btnPrimary, confirmClass)}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

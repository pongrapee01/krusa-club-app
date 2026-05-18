import { useEffect, useId, type ReactNode } from 'react'

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
  /** ช่องเพิ่มเติม เช่น textarea เหตุผลล็อกบัญชี */
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
      ? 'bg-rose-600 hover:bg-rose-500 ring-rose-400/50'
      : 'bg-orange-600 hover:bg-orange-500 ring-orange-400/50'

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain" role="presentation">
      <button
        type="button"
        aria-label="ปิดกล่องโต้ตอบ"
        className="fixed inset-0 cursor-default bg-slate-950/60 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md items-center px-3 py-8 sm:px-4"
      >
        <div
          className={cn(
            'w-full rounded-2xl border border-white/15 bg-slate-950/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-md',
          )}
        >
          <h2 id={titleId} className="text-lg font-semibold text-white">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/75">{description}</p>
          {children ? <div className="mt-4">{children}</div> : null}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium text-white ring-1 ring-white/25 transition hover:bg-white/10"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={cn(
                'inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white shadow-md transition ring-1',
                confirmClass,
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

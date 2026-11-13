import { X } from 'lucide-react'
import { useEffect, useId, useState, type FormEvent } from 'react'

import { getSection, STATUS_OPTIONS } from '@/features/config-master/config/sections'
import type { MasterFieldDef, MasterFormMode, MasterKey } from '@/features/config-master/types'
import { ed } from '@/lib/edtech-ui'
import { cn } from '@/lib/utils'

const inputClass = cn(ed.input, 'mt-1 py-2 disabled:cursor-not-allowed disabled:opacity-60')
const labelClass = cn(ed.label, 'block')

type MasterCrudModalProps = {
  open: boolean
  mode: MasterFormMode
  sectionKey: MasterKey
  initial: Record<string, unknown> | null
  parentMenuOptions?: { value: string; label: string }[]
  onClose: () => void
  onSave: (values: Record<string, unknown>) => void
}

function rowToForm(
  row: Record<string, unknown>,
  fields: MasterFieldDef[],
): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {}
  for (const f of fields) {
    const raw = row[f.name]
    if (f.type === 'checkbox') {
      out[f.name] = Boolean(raw)
    } else if (f.type === 'number') {
      out[f.name] = raw === undefined || raw === null ? '' : String(raw)
    } else if (f.name === 'parentCode') {
      out[f.name] = raw == null || raw === '' ? '' : String(raw)
    } else {
      out[f.name] = raw === undefined || raw === null ? '' : String(raw)
    }
  }
  return out
}

function formToRow(
  form: Record<string, string | boolean>,
  fields: MasterFieldDef[],
  base: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...base }
  for (const f of fields) {
    const v = form[f.name]
    if (f.type === 'checkbox') {
      out[f.name] = Boolean(v)
    } else if (f.type === 'number') {
      const n = Number(v)
      out[f.name] = Number.isFinite(n) ? n : 0
    } else if (f.name === 'parentCode') {
      const s = String(v).trim()
      out[f.name] = s.length ? s : null
    } else if (f.type === 'select' && f.name === 'term') {
      out[f.name] = Number(v) === 2 ? 2 : 1
    } else {
      out[f.name] = String(v).trim()
    }
  }
  return out
}

function validateForm(
  form: Record<string, string | boolean>,
  fields: MasterFieldDef[],
): Record<string, string> {
  const err: Record<string, string> = {}
  for (const f of fields) {
    if (!f.required) continue
    if (f.type === 'checkbox') continue
    const v = String(form[f.name] ?? '').trim()
    if (!v) err[f.name] = `กรุณากรอก${f.label}`
  }
  return err
}

export function MasterCrudModal(props: MasterCrudModalProps) {
  const { open, sectionKey, mode, initial } = props
  if (!open) return null
  return (
    <MasterCrudModalInner
      key={`${sectionKey}-${mode}-${String(initial?.id ?? 'new')}`}
      {...props}
    />
  )
}

function MasterCrudModalInner({
  mode,
  sectionKey,
  initial,
  parentMenuOptions,
  onClose,
  onSave,
}: MasterCrudModalProps) {
  const titleId = useId()
  const section = getSection(sectionKey)
  const readOnly = mode === 'view'

  const baseRow = initial ? { ...initial } : {}

  const [form, setForm] = useState<Record<string, string | boolean>>(() =>
    rowToForm(baseRow, section.fields),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const title =
    mode === 'create'
      ? `เพิ่ม${section.label}`
      : mode === 'edit'
        ? `แก้ไข${section.label}`
        : `ดู${section.label}`

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (readOnly) {
      onClose()
      return
    }
    const nextErrors = validateForm(form, section.fields)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSave(formToRow(form, section.fields, baseRow))
  }

  const setField = (name: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const renderField = (f: MasterFieldDef) => {
    const err = errors[f.name]
    let options = f.options
    if (f.name === 'parentCode' && parentMenuOptions) {
      options = parentMenuOptions
    }
    if ((f.name === 'statusCode' || f.name === 'status') && !options) {
      options = [...STATUS_OPTIONS]
    }

    if (f.type === 'checkbox') {
      return (
        <label key={f.name} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(form[f.name])}
            disabled={readOnly}
            className="size-4 rounded border-slate-300 text-blue-600 focus-visible:ring-blue-400/50"
            onChange={(e) => setField(f.name, e.target.checked)}
          />
          {f.label}
        </label>
      )
    }

    if (f.type === 'textarea') {
      return (
        <label key={f.name} className="block">
          <span className={labelClass}>
            {f.label}
            {f.required ? ' *' : ''}
          </span>
          <textarea
            rows={3}
            disabled={readOnly}
            className={cn(inputClass, 'resize-y')}
            placeholder={f.placeholder}
            value={String(form[f.name] ?? '')}
            onChange={(e) => setField(f.name, e.target.value)}
          />
          {err ? <p className="mt-1 text-xs text-rose-600">{err}</p> : null}
        </label>
      )
    }

    if (f.type === 'select') {
      return (
        <label key={f.name} className="block">
          <span className={labelClass}>
            {f.label}
            {f.required ? ' *' : ''}
          </span>
          <select
            disabled={readOnly}
            className={inputClass}
            value={String(form[f.name] ?? '')}
            onChange={(e) => setField(f.name, e.target.value)}
          >
            {(options ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {err ? <p className="mt-1 text-xs text-rose-600">{err}</p> : null}
        </label>
      )
    }

    const inputType =
      f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'time' ? 'time' : 'text'

    return (
      <label key={f.name} className="block">
        <span className={labelClass}>
          {f.label}
          {f.required ? ' *' : ''}
        </span>
        <input
          type={inputType}
          disabled={readOnly}
          min={f.min}
          max={f.max}
          className={inputClass}
          placeholder={f.placeholder}
          value={String(form[f.name] ?? '')}
          onChange={(e) => setField(f.name, e.target.value)}
        />
        {err ? <p className="mt-1 text-xs text-rose-300">{err}</p> : null}
      </label>
    )
  }

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain" role="presentation">
      <button
        type="button"
        aria-label="ปิด"
        className="fixed inset-0 cursor-default bg-slate-900/25 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-lg items-center px-4 py-8">
        <form
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onSubmit={handleSubmit}
          className={cn(ed.surface, 'w-full p-6')}
        >
          <div className="flex items-start justify-between gap-3">
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            <button
              type="button"
              aria-label="ปิด"
              className={ed.btnGhost}
              onClick={onClose}
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">{section.description}</p>

          <div className="mt-4 max-h-[min(60vh,28rem)] space-y-3 overflow-y-auto pr-1">
            {section.fields.map(renderField)}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" className={ed.btnSecondary} onClick={onClose}>
              {readOnly ? 'ปิด' : 'ยกเลิก'}
            </button>
            {!readOnly ? (
              <button type="submit" className={ed.btnSuccess}>
                {mode === 'create' ? 'เพิ่มในรายการ' : 'บันทึกในรายการ'}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  )
}

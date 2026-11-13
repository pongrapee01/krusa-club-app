import { Download, FileUp, X } from 'lucide-react'
import { useCallback, useEffect, useId, useState, type ChangeEventHandler } from 'react'

import { buildStudentCsvTemplate, parseStudentImportCsv } from '@/features/user-management/lib/studentCsvImport'
import type { StudentRow } from '@/features/user-management/types'
import { ed } from '@/lib/edtech-ui'
import { cn } from '@/lib/utils'

type StudentImportModalProps = {
  open: boolean
  onClose: () => void
  onImported: (rows: StudentRow[]) => void
}

export function StudentImportModal({ open, onClose, onImported }: StudentImportModalProps) {
  const titleId = useId()
  const [csvText, setCsvText] = useState('')
  const [fileLabel, setFileLabel] = useState<string | null>(null)
  const [parsed, setParsed] = useState<ReturnType<typeof parseStudentImportCsv> | null>(null)

  const handleClose = useCallback(() => {
    setCsvText('')
    setFileLabel(null)
    setParsed(null)
    onClose()
  }, [onClose])

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
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, handleClose])

  const runParse = (text: string) => {
    setParsed(parseStudentImportCsv(text))
  }

  const onPickFile: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setFileLabel(file.name)
    const text = await file.text()
    setCsvText(text)
    runParse(text)
  }

  const downloadTemplate = () => {
    const blob = new Blob([`\ufeff${buildStudentCsvTemplate()}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = () => {
    if (!parsed?.rows.length) return
    onImported(parsed.rows)
    handleClose()
  }

  if (!open) return null

  const okCount = parsed?.rows.length ?? 0
  const errCount = parsed?.errors.length ?? 0

  return (
    <div className="fixed inset-0 z-[56] overflow-y-auto overscroll-contain" role="presentation">
      <button
        type="button"
        aria-label="ปิด"
        className="fixed inset-0 cursor-default bg-slate-900/25 backdrop-blur-[2px]"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-2xl items-center px-4 py-8"
      >
        <div className={cn(ed.surface, 'w-full p-5 sm:p-6')}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-slate-900 sm:text-xl">
                นำเข้านักเรียน (CSV)
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                รองรับ UTF-8 คั่นด้วย comma หรือ tab — ใช้หัวคอลัมน์ตามแม่แบบ แถวที่ผิดจะถูกข้ามและแสดงด้านล่าง
              </p>
            </div>
            <button type="button" aria-label="ปิด" onClick={handleClose} className={ed.btnGhost}>
              <X className="size-5" />
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" onClick={downloadTemplate} className={ed.btnSecondary}>
              <Download className="size-4 shrink-0" aria-hidden />
              ดาวน์โหลดแม่แบบ CSV
            </button>
            <label className={cn(ed.btnPrimary, 'h-10 cursor-pointer')}>
              <FileUp className="size-4 shrink-0" aria-hidden />
              เลือกไฟล์ CSV
              <input type="file" accept=".csv,.txt,text/csv" className="sr-only" onChange={onPickFile} />
            </label>
          </div>
          {fileLabel ? <p className="mt-2 text-xs text-slate-500">ไฟล์: {fileLabel}</p> : null}

          <label className="mt-4 block text-sm text-slate-700">
            <span className={cn(ed.label, 'mb-1 block')}>แก้ไข / วาง CSV แล้วกดตรวจสอบ</span>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={8}
              spellCheck={false}
              className={cn(
                ed.input,
                'mt-1 font-mono text-xs',
              )}
              placeholder="วางเนื้อหา CSV ที่นี่…"
            />
          </label>
          <button type="button" onClick={() => runParse(csvText)} className={cn(ed.btnSecondary, 'mt-2 h-9')}>
            ตรวจสอบข้อมูล
          </button>

          {parsed ? (
            <div className={cn(ed.surfaceInner, 'mt-4 space-y-3 p-3')}>
              <p className="text-sm text-slate-700">
                พร้อมนำเข้า <span className="font-semibold text-emerald-700">{okCount}</span> รายการ
                {errCount > 0 ? (
                  <>
                    {' '}
                    · ข้าม / ผิดพลาด <span className="font-semibold text-amber-800">{errCount}</span> แถว
                  </>
                ) : null}
              </p>
              {parsed.errors.length > 0 ? (
                <div className="max-h-32 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                  <p className="mb-1 font-medium text-amber-800">รายการแถวที่ไม่นำเข้า</p>
                  <ul className="list-inside list-disc space-y-0.5">
                    {parsed.errors.map((err, i) => (
                      <li key={`${err.line}-${i}`}>
                        บรรทัด {err.line}: {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={handleClose} className={ed.btnSecondary}>
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={!okCount}
              onClick={doImport}
              className={cn(
                ed.btnPrimary,
                'disabled:cursor-not-allowed disabled:opacity-45',
              )}
            >
              นำเข้า {okCount ? `${okCount} รายการ` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

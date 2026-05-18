import { Download, FileUp, X } from 'lucide-react'
import { useCallback, useEffect, useId, useState, type ChangeEventHandler } from 'react'

import { buildStudentCsvTemplate, parseStudentImportCsv } from '@/features/user-management/lib/studentCsvImport'
import type { StudentRow } from '@/features/user-management/types'
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
        className="fixed inset-0 cursor-default bg-slate-950/60 backdrop-blur-[2px]"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-2xl items-center px-3 py-8 sm:px-4"
      >
        <div className="w-full rounded-2xl border border-white/15 bg-slate-950/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-md sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-white sm:text-xl">
                นำเข้านักเรียน (CSV)
              </h2>
              <p className="mt-1 text-sm text-white/70">
                รองรับ UTF-8 คั่นด้วย comma หรือ tab — ใช้หัวคอลัมน์ตามแม่แบบ แถวที่ผิดจะถูกข้ามและแสดงด้านล่าง
              </p>
            </div>
            <button
              type="button"
              aria-label="ปิด"
              onClick={handleClose}
              className="rounded-lg p-2 text-white/80 ring-1 ring-white/20 hover:bg-white/10"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-white ring-1 ring-white/25 hover:bg-white/10"
            >
              <Download className="size-4 shrink-0" aria-hidden />
              ดาวน์โหลดแม่แบบ CSV
            </button>
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-600/90 px-4 text-sm font-semibold text-white ring-1 ring-orange-400/45 hover:bg-orange-500">
              <FileUp className="size-4 shrink-0" aria-hidden />
              เลือกไฟล์ CSV
              <input type="file" accept=".csv,.txt,text/csv" className="sr-only" onChange={onPickFile} />
            </label>
          </div>
          {fileLabel ? <p className="mt-2 text-xs text-white/55">ไฟล์: {fileLabel}</p> : null}

          <label className="mt-4 block text-sm text-white/75">
            <span className="mb-1 block font-medium text-white/85">แก้ไข / วาง CSV แล้วกดตรวจสอบ</span>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={8}
              spellCheck={false}
              className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 font-mono text-xs text-white placeholder:text-white/35 focus-visible:border-orange-400/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/35"
              placeholder="วางเนื้อหา CSV ที่นี่…"
            />
          </label>
          <button
            type="button"
            onClick={() => runParse(csvText)}
            className="mt-2 inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/10"
          >
            ตรวจสอบข้อมูล
          </button>

          {parsed ? (
            <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-sm text-white/90">
                พร้อมนำเข้า <span className="font-semibold text-emerald-200">{okCount}</span> รายการ
                {errCount > 0 ? (
                  <>
                    {' '}
                    · ข้าม / ผิดพลาด <span className="font-semibold text-amber-200">{errCount}</span> แถว
                  </>
                ) : null}
              </p>
              {parsed.errors.length > 0 ? (
                <div className="max-h-32 overflow-y-auto rounded-lg border border-amber-400/25 bg-amber-950/20 p-2 text-xs text-amber-100/95">
                  <p className="mb-1 font-medium text-amber-200">รายการแถวที่ไม่นำเข้า</p>
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

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="h-10 rounded-xl px-4 text-sm font-medium text-white ring-1 ring-white/25 hover:bg-white/10"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={!okCount}
              onClick={doImport}
              className={cn(
                'h-10 rounded-xl px-4 text-sm font-semibold ring-1 transition',
                okCount
                  ? 'bg-orange-600 text-white ring-orange-400/45 hover:bg-orange-500'
                  : 'cursor-not-allowed bg-white/10 text-white/45 ring-white/10',
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

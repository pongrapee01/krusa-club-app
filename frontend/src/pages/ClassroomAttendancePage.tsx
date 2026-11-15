import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, CalendarClock, ClipboardCheck, Loader2, RefreshCw, Sparkles, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { AttendanceStudentCard } from '@/components/classroom/AttendanceStudentCard'
import { ApiError } from '@/lib/api/apiClient'
import { env } from '@/lib/env'
import { ed } from '@/lib/edtech-ui'
import { cn } from '@/lib/utils'
import {
  type AttendanceRollScope,
  type AttendanceStatus,
  type RollCallSessionDto,
  fetchRollCallSession,
  isAttendanceRollCallMockEnabled,
  nextAttendanceStatus,
  saveRollCallSession,
} from '@/services/attendanceService'

const QUERY_ROOT = ['classroom', 'attendance', 'roll-call'] as const

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** ค่าให้ `<input type="datetime-local" />` */
function toDatetimeLocalValue(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function defaultHistoryDatetime(): string {
  const d = new Date()
  d.setHours(8, 0, 0, 0)
  return toDatetimeLocalValue(d)
}

function formatHistoryAtTh(isoLocal: string): string {
  const [datePart, timePart] = isoLocal.split('T')
  if (!datePart || !timePart) return isoLocal
  const [y, m, day] = datePart.split('-').map(Number)
  const [hh, mm] = timePart.split(':').map(Number)
  if (!y || !m || !day || Number.isNaN(hh) || Number.isNaN(mm)) return isoLocal
  const dt = new Date(y, m - 1, day, hh, mm)
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(dt)
}

function apiBaseConfigured(): boolean {
  return Boolean(env.VITE_API_BASE_URL?.trim())
}

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const p = err.payload
    if (p && typeof p === 'object' && 'message' in p && typeof (p as { message: unknown }).message === 'string') {
      return (p as { message: string }).message
    }
    return `${err.message} (${err.status})`
  }
  if (err instanceof Error) return err.message
  return 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'
}

function formatTimeRange(start?: string | null, end?: string | null): string | null {
  if (!start && !end) return null
  if (start && end) return `${start} – ${end}`
  return start ?? end ?? null
}

export function ClassroomAttendancePage() {
  const queryClient = useQueryClient()
  const [rollScope, setRollScope] = useState<AttendanceRollScope>('period')
  const [viewMode, setViewMode] = useState<'smart' | 'history'>('smart')
  const [historyAt, setHistoryAt] = useState(defaultHistoryDatetime)
  const [overrides, setOverrides] = useState<Partial<Record<string, AttendanceStatus>>>({})
  const [saveOk, setSaveOk] = useState<string | null>(null)
  const [saveErr, setSaveErr] = useState<string | null>(null)

  const enabled = apiBaseConfigured() || isAttendanceRollCallMockEnabled()

  const fetchParams = useMemo(() => {
    if (viewMode === 'smart') {
      return rollScope === 'homeroom' ? { scope: 'homeroom' as const } : undefined
    }
    return { at: historyAt, scope: rollScope }
  }, [viewMode, rollScope, historyAt])

  const queryKey = useMemo(
    () => [...QUERY_ROOT, viewMode, rollScope, viewMode === 'history' ? historyAt : 'current'] as const,
    [viewMode, rollScope, historyAt],
  )

  const historyAtValid = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(historyAt)

  const query = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchRollCallSession(fetchParams),
    enabled: enabled && (viewMode !== 'history' || historyAtValid),
  })

  /* eslint-disable react-hooks/set-state-in-effect -- รีเซ็ต draft ท้องถิ่นเมื่อขอบเขตเซสชัน/ sessionId จากเซิร์ฟเวอร์เปลี่ยน */
  useEffect(() => {
    setOverrides({})
    setSaveOk(null)
    setSaveErr(null)
  }, [viewMode, rollScope, historyAt, query.data?.sessionId])
  /* eslint-enable react-hooks/set-state-in-effect */

  const session = query.data

  const advanceStatus = useCallback((studentId: string, serverStatus: AttendanceStatus) => {
    if (!session) return
    setOverrides((prev) => {
      const cur = (prev[studentId] ?? serverStatus) as AttendanceStatus
      const next = nextAttendanceStatus(cur)
      if (next === serverStatus) {
        const nextOverrides = { ...prev }
        delete nextOverrides[studentId]
        return nextOverrides
      }
      return { ...prev, [studentId]: next }
    })
  }, [session])

  const dirty = useMemo(() => {
    if (!session) return false
    return session.students.some((s) => (overrides[s.studentId] ?? s.status) !== s.status)
  }, [session, overrides])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error('ไม่มีข้อมูลเซสชัน')
      const students = session.students.map((s) => ({
        studentId: s.studentId,
        status: (overrides[s.studentId] ?? s.status) as AttendanceStatus,
        note: s.note ?? null,
      }))
      await saveRollCallSession({
        sessionId: session.sessionId,
        sessionDate: session.sessionDate,
        students,
      })
    },
    onSuccess: async () => {
      setSaveErr(null)
      setSaveOk('บันทึกเช็คชื่อแล้ว')
      setOverrides({})
      await queryClient.invalidateQueries({
        queryKey: [...QUERY_ROOT],
      })
    },
    onError: (e) => {
      setSaveOk(null)
      setSaveErr(errorMessage(e))
    },
  })

  const scopeDescription =
    rollScope === 'period'
      ? 'เช็คชื่อรายคาบเรียน — ระบบจับคาบจากตารางสอน ค่าเริ่มต้นทุกคนเป็น "มาเรียน" แตะการ์ดเฉพาะคนที่ไม่ปกติ แล้วกดบันทึกครั้งเดียว'
      : 'เช็คชื่อหน้าแถว — สำหรับครูประจำชั้น รายชื่อห้องเรียน ไม่ผูกวิชาแต่ละคาบ ค่าเริ่มต้นเหมือนกัน: ทุกคนมา จนกว่าคุณจะแตะเปลี่ยน'

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-full border border-white bg-gradient-to-b from-white to-slate-100 shadow-ed-btn-soft ring-1 ring-slate-100 sm:size-12">
              <ClipboardCheck className="size-5 text-emerald-600 sm:size-6" aria-hidden />
            </div>
            <div>
              <h1 className={ed.pageTitle}>เช็คชื่อ</h1>
              <p className={cn('mt-1', ed.pageLead)}>{scopeDescription}</p>
            </div>
          </div>
        </div>
      </div>

      {enabled ? (
        <div className="space-y-4">
          <div>
            <p className={cn('mb-2', ed.labelCaps)}>เลือกประเภทการเช็คชื่อ</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setRollScope('period')
                  if (viewMode === 'smart') void query.refetch()
                }}
                className={cn(
                  'flex min-h-[52px] flex-col items-start gap-1 rounded-3xl border px-4 py-3 text-left shadow-ed-raised transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
                  rollScope === 'period'
                    ? 'border-orange-400/55 bg-orange-600/25 text-white ring-1 ring-orange-400/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="size-4 shrink-0 text-orange-600" aria-hidden />
                  เช็คชื่อรายคาบเรียน
                </span>
                <span className={cn('text-xs leading-snug', ed.textMuted)}>
                  Smart detect คาบปัจจุบัน · แก้ย้อนหลังตามวัน-เวลาของคาบ
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRollScope('homeroom')
                  if (viewMode === 'smart') void query.refetch()
                }}
                className={cn(
                  'flex min-h-[52px] flex-col items-start gap-1 rounded-3xl border px-4 py-3 text-left shadow-ed-raised transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
                  rollScope === 'homeroom'
                    ? 'border-teal-400/55 bg-teal-700/30 text-white ring-1 ring-teal-400/25'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="size-4 shrink-0 text-teal-600" aria-hidden />
                  เช็คชื่อหน้าแถว
                </span>
                <span className={cn('text-xs leading-snug', ed.textMuted)}>
                  ครูประจำชั้น · รายชื่อห้อง · แยกจากคาบวิชา
                </span>
              </button>
            </div>
          </div>

          <div className={cn(ed.surface, 'p-4')}>
            <p className={cn('mb-3', ed.labelCaps)}>ช่วงเวลาที่กำลังเช็ค</p>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('smart')
                    void query.refetch()
                  }}
                  className={cn(
                    'inline-flex min-h-[44px] items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold shadow-ed-btn-soft transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
                    viewMode === 'smart'
                      ? 'border-orange-400/55 bg-orange-600/90 text-white shadow-md shadow-orange-950/30'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  <Sparkles className="size-4 shrink-0" aria-hidden />
                  {rollScope === 'period' ? 'คาบจากตาราง (ตอนนี้)' : 'หน้าแถววันนี้'}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('history')}
                  className={cn(
                    'inline-flex min-h-[44px] items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold shadow-ed-btn-soft transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
                    viewMode === 'history'
                      ? 'border-sky-400/55 bg-sky-600/85 text-white shadow-md shadow-sky-950/30'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  <CalendarClock className="size-4 shrink-0" aria-hidden />
                  ย้อนหลัง (เลือกวัน-เวลา)
                </button>
              </div>

              {viewMode === 'history' ? (
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 lg:max-w-xl">
                  <label htmlFor="attendance-history-datetime" className="sr-only">
                    เลือกวันและเวลาเพื่อแก้แผ่นเช็คชื่อย้อนหลัง
                  </label>
                  <input
                    id="attendance-history-datetime"
                    type="datetime-local"
                    value={historyAt}
                    onChange={(e) => setHistoryAt(e.target.value)}
                    className={cn(ed.input, 'min-h-[44px] tabular-nums')}
                  />
                  <p className={cn('text-xs leading-relaxed sm:max-w-[14rem]', ed.textMuted)}>
                    {rollScope === 'period'
                      ? 'เวลาที่เลือกใช้ชี้ไปที่คาบในวันนั้น (ตามตาราง)'
                      : 'เวลาที่เลือกใช้ชี้ไปที่รอบหน้าแถวในวันนั้น (ตามกำหนดโรงเรียน)'}
                  </p>
                </div>
              ) : null}
            </div>
            {viewMode === 'history' ? (
              <p className={cn('mt-3 text-xs', ed.textMuted)}>
                กำลังดูแผ่น: <span className={cn('font-medium', ed.textSub)}>{formatHistoryAtTh(historyAt)}</span>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {!enabled ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200/80">
          ยังไม่ได้ตั้งค่า <code className={ed.code}>VITE_API_BASE_URL</code> — ระบบเช็คชื่อจะเรียก API ไม่ได้
          <span className={cn('mt-2 block', ed.textWarning)}>
            ถ้าต้องการดู UI การ์ดรายชื่อโดยไม่มี backend ให้ตั้ง{' '}
            <code className={ed.code}>VITE_USE_ATTENDANCE_MOCK=true</code> แล้วรีสตาร์ท dev server
          </span>
        </div>
      ) : null}

      {isAttendanceRollCallMockEnabled() ? (
        <div className="rounded-3xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900 ring-1 ring-violet-200/80">
          <strong className="font-semibold text-violet-950">โหมด mock:</strong> แสดงรายชื่อตัวอย่างจาก{' '}
          <code className={ed.code}>src/mocks/attendanceRollCallMock.ts</code> — ปุ่มบันทึกจะไม่ยิง API จริง
        </div>
      ) : null}

      {enabled && viewMode === 'history' && !historyAtValid ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200/80">
          เลือก<strong className="font-semibold text-amber-950"> วันและเวลา </strong>ใน datetime picker ให้ครบ
          (รูปแบบ ปี-เดือน-วัน และชั่วโมง:นาที) แล้วระบบจะโหลดแผ่นเช็คชื่อให้อัตโนมัติ
        </div>
      ) : null}

      {enabled && query.isPending ? (
        <div className={cn(ed.surfaceInner, 'flex items-center gap-2 px-4 py-6 text-sm', ed.textSub)}>
          <Loader2 className="size-5 shrink-0 animate-spin text-orange-500" aria-hidden />
          {viewMode === 'history'
            ? 'กำลังโหลดแผ่นตามวัน-เวลาที่เลือก…'
            : rollScope === 'homeroom'
              ? 'กำลังโหลดหน้าแถว…'
              : 'กำลังโหลดจากตารางสอน…'}
        </div>
      ) : null}

      {enabled && query.isError ? (
        <div className="space-y-3 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200/80">
          <p className="font-medium text-rose-900">โหลดข้อมูลไม่สำเร็จ</p>
          <p className="text-rose-700">{errorMessage(query.error)}</p>
          {viewMode === 'smart' ? (
            <p className="text-xs text-rose-600">
              ลองสลับเป็น &quot;ย้อนหลัง&quot; แล้วเลือกวัน-เวลาใน datetime picker เพื่อโหลดแผ่นย้อนหลัง หรือเปลี่ยนเป็นเช็คชื่อหน้าแถวถ้าคุณเป็นครูประจำชั้น
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void query.refetch()}
            className={cn(ed.btnSecondary, 'px-3 py-2 text-xs')}
          >
            <RefreshCw className="size-3.5" aria-hidden />
            ลองใหม่
          </button>
        </div>
      ) : null}

      {enabled && query.isSuccess && session ? (
        <>
          <SmartSessionBanner session={session} viewMode={viewMode} requestedScope={rollScope} />

          {saveOk ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200/80">
              {saveOk}
            </div>
          ) : null}
          {saveErr ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 ring-1 ring-rose-200/80">
              {saveErr}
            </div>
          ) : null}

          <LegendStrip />

          {session.students.length === 0 ? (
            <div className={cn(ed.surfaceInner, 'p-8 text-center text-sm', ed.textMuted)}>
              {rollScope === 'homeroom'
                ? 'ไม่มีรายชื่อห้องนี้ — ตรวจสอบว่าคุณเป็นครูประจำชั้นหรือสิทธิ์การเข้าถึง'
                : 'ไม่มีรายชื่อในคาบนี้ — ตรวจสอบตารางสอนหรือสิทธิ์ของคุณ'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {session.students.map((s) => {
                const effective = (overrides[s.studentId] ?? s.status) as AttendanceStatus
                return (
                  <AttendanceStudentCard
                    key={s.studentId}
                    displayName={s.displayName}
                    seatNumber={s.seatNumber}
                    avatarUrl={s.avatarUrl}
                    serverStatus={s.status}
                    effectiveStatus={effective}
                    onAdvance={() => advanceStatus(s.studentId, s.status)}
                  />
                )
              })}
            </div>
          )}

          <div className={cn(ed.surface, 'flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between')}>
            <div className={cn('text-xs leading-relaxed', ed.textSub)}>
              <p>
                <strong className={ed.text}>Note:</strong> ทุกคนเริ่มที่ &quot;มาเรียน&quot;
                — แตะการ์ดเพื่อวนสถานะ มา → ขาด → สาย → ลา → โดดเรียน → มา
              </p>
              <p className={cn('mt-1', ed.textMuted)}>
                โดดเรียน = เช้ามาเรียน แต่บ่ายหายตัว — ใช้ส่งรายงานฝ่ายกิจการนักเรียน
              </p>
            </div>
            <button
              type="button"
              disabled={!dirty || saveMutation.isPending}
              onClick={() => {
                setSaveOk(null)
                setSaveErr(null)
                void saveMutation.mutateAsync()
              }}
              className="inline-flex h-12 min-w-[11rem] shrink-0 items-center justify-center rounded-full border border-sky-400/50 bg-gradient-to-b from-sky-400 to-sky-500 px-6 text-sm font-semibold text-white shadow-ed-btn transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45"
            >
              {saveMutation.isPending ? 'กำลังบันทึก…' : 'บันทึกทั้งแผ่น'}
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}

function SmartSessionBanner({
  session,
  viewMode,
  requestedScope,
}: {
  session: RollCallSessionDto
  viewMode: 'smart' | 'history'
  requestedScope: AttendanceRollScope
}) {
  const range = formatTimeRange(session.periodStart, session.periodEnd)
  const scope = session.attendanceScope ?? requestedScope
  const isHomeroom = scope === 'homeroom'
  const showSmartBanner = viewMode === 'smart' || session.smartMatched === true

  const kicker = (() => {
    if (isHomeroom) {
      return viewMode === 'history' ? 'แก้อดีต — หน้าแถว' : 'หน้าแถว — ครูประจำชั้น'
    }
    if (viewMode === 'history') return 'รายคาบ — แก้อดีต (ตามวัน-เวลา)'
    if (showSmartBanner && session.smartMatched) return 'Smart detect — ตารางสอน'
    if (showSmartBanner) return 'รายคาบ — ตารางสอน'
    return 'รายคาบเรียน'
  })()

  return (
    <div className={cn(ed.surface, 'overflow-hidden bg-gradient-to-br from-slate-50 via-white to-sky-50/40 p-4 sm:p-5')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.12em]',
              isHomeroom ? 'text-teal-700' : 'text-orange-700',
            )}
          >
            {kicker}
          </p>
          <p className={cn(ed.sectionTitle, 'sm:text-xl')}>{session.classLabel}</p>
          {isHomeroom ? (
            <p className={ed.sectionLead}>
              {session.periodLabel ? (
                <span className={ed.text}>{session.periodLabel}</span>
              ) : (
                <span>รายชื่อห้องเรียน · ไม่ผูกวิชารายคาบ</span>
              )}
            </p>
          ) : session.subjectName ? (
            <p className={ed.sectionLead}>
              วิชา <span className={cn('font-medium', ed.text)}>{session.subjectName}</span>
              {session.periodLabel ? (
                <>
                  {' '}
                  · <span className={ed.text}>{session.periodLabel}</span>
                </>
              ) : null}
            </p>
          ) : session.periodLabel ? (
            <p className={ed.sectionLead}>{session.periodLabel}</p>
          ) : null}
          {range ? <p className={cn('text-xs tabular-nums', ed.textMuted)}>{range}</p> : null}
        </div>
        <div className={cn(ed.surfaceInner, 'shrink-0 px-3 py-2 text-right')}>
          <p className={ed.labelCaps}>วันที่ข้อมูล</p>
          <p className={cn('text-sm font-semibold tabular-nums', ed.text)}>{session.sessionDate}</p>
        </div>
      </div>
    </div>
  )
}

function LegendStrip() {
  const items: Array<{ s: AttendanceStatus; label: string; hint: string }> = [
    { s: 'present', label: 'มา', hint: 'ค่าเริ่มต้น' },
    { s: 'absent', label: 'ขาด', hint: 'ไม่เข้าเรียน' },
    { s: 'late', label: 'สาย', hint: 'มาช้า' },
    { s: 'leave', label: 'ลา', hint: 'อนุมัติ' },
    { s: 'cut_class', label: 'โดดเรียน', hint: 'เช้ามา / บ่ายหาย' },
  ]
  return (
    <div className={cn(ed.surfaceInner, 'flex flex-wrap gap-2 p-3')}>
      {items.map(({ s, label, hint }) => (
        <div
          key={s}
          className={cn(
            'flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs',
            ed.textSub,
          )}
        >
          <span
            className={cn(
              'size-2 shrink-0 rounded-full',
              s === 'present' && 'bg-emerald-500',
              s === 'absent' && 'bg-rose-500',
              s === 'late' && 'bg-amber-400',
              s === 'leave' && 'bg-sky-500',
              s === 'cut_class' && 'bg-violet-500',
            )}
            aria-hidden
          />
          <span className="font-semibold">{label}</span>
          <span className={cn('truncate', ed.textMuted)}>· {hint}</span>
        </div>
      ))}
    </div>
  )
}

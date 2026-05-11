import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, CalendarClock, ClipboardCheck, Loader2, RefreshCw, Sparkles, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { AttendanceStudentCard } from '@/components/classroom/AttendanceStudentCard'
import { ApiError } from '@/lib/api/apiClient'
import { env } from '@/lib/env'
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

  useEffect(() => {
    setOverrides({})
    setSaveOk(null)
    setSaveErr(null)
  }, [viewMode, rollScope, historyAt, query.data?.sessionId])

  const session = query.data

  const advanceStatus = useCallback((studentId: string, serverStatus: AttendanceStatus) => {
    if (!session) return
    setOverrides((prev) => {
      const cur = (prev[studentId] ?? serverStatus) as AttendanceStatus
      const next = nextAttendanceStatus(cur)
      if (next === serverStatus) {
        const { [studentId]: _, ...rest } = prev
        return rest
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
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 shadow-inner ring-1 ring-white/10 sm:size-12">
              <ClipboardCheck className="size-5 text-emerald-200 sm:size-6" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">เช็คชื่อ</h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">{scopeDescription}</p>
            </div>
          </div>
        </div>
      </div>

      {enabled ? (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/50">เลือกประเภทการเช็คชื่อ</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setRollScope('period')
                  if (viewMode === 'smart') void query.refetch()
                }}
                className={cn(
                  'flex min-h-[52px] flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left transition',
                  rollScope === 'period'
                    ? 'border-orange-400/55 bg-orange-600/25 text-white ring-1 ring-orange-400/30'
                    : 'border-white/15 bg-slate-950/50 text-white/80 hover:border-white/25 hover:bg-slate-900/70',
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="size-4 shrink-0 text-orange-200" aria-hidden />
                  เช็คชื่อรายคาบเรียน
                </span>
                <span className="text-xs leading-snug text-white/55">
                  ผูกตารางสอน · Smart detect คาบปัจจุบัน · แก้ย้อนหลังตามวัน-เวลาของคาบ
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRollScope('homeroom')
                  if (viewMode === 'smart') void query.refetch()
                }}
                className={cn(
                  'flex min-h-[52px] flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left transition',
                  rollScope === 'homeroom'
                    ? 'border-teal-400/55 bg-teal-700/30 text-white ring-1 ring-teal-400/25'
                    : 'border-white/15 bg-slate-950/50 text-white/80 hover:border-white/25 hover:bg-slate-900/70',
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="size-4 shrink-0 text-teal-200" aria-hidden />
                  เช็คชื่อหน้าแถว
                </span>
                <span className="text-xs leading-snug text-white/55">
                  ครูประจำชั้น · รายชื่อห้อง · แยกจากคาบวิชา
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/12 bg-slate-950/40 p-4 ring-1 ring-white/10">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-white/50">ช่วงเวลาที่กำลังเช็ค</p>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('smart')
                    void query.refetch()
                  }}
                  className={cn(
                    'inline-flex min-h-[44px] items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition',
                    viewMode === 'smart'
                      ? 'border-orange-400/55 bg-orange-600/90 text-white shadow-md shadow-orange-950/30'
                      : 'border-white/20 bg-slate-900/50 text-white/85 hover:bg-white/10',
                  )}
                >
                  <Sparkles className="size-4 shrink-0" aria-hidden />
                  {rollScope === 'period' ? 'คาบจากตาราง (ตอนนี้)' : 'หน้าแถววันนี้'}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('history')}
                  className={cn(
                    'inline-flex min-h-[44px] items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition',
                    viewMode === 'history'
                      ? 'border-sky-400/55 bg-sky-600/85 text-white shadow-md shadow-sky-950/30'
                      : 'border-white/20 bg-slate-900/50 text-white/85 hover:bg-white/10',
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
                    className="min-h-[44px] w-full min-w-0 flex-1 rounded-xl border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-white tabular-nums shadow-inner outline-none ring-0 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/30"
                  />
                  <p className="text-xs leading-relaxed text-white/55 sm:max-w-[14rem]">
                    {rollScope === 'period'
                      ? 'เวลาที่เลือกใช้ชี้ไปที่คาบในวันนั้น (ตามตาราง)'
                      : 'เวลาที่เลือกใช้ชี้ไปที่รอบหน้าแถวในวันนั้น (ตามกำหนดโรงเรียน)'}
                  </p>
                </div>
              ) : null}
            </div>
            {viewMode === 'history' ? (
              <p className="mt-3 text-xs text-white/45">
                กำลังดูแผ่น: <span className="font-medium text-white/75">{formatHistoryAtTh(historyAt)}</span>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {!enabled ? (
        <div className="rounded-2xl border border-amber-400/35 bg-amber-950/35 p-4 text-sm text-amber-50 ring-1 ring-amber-400/20 backdrop-blur-sm">
          ยังไม่ได้ตั้งค่า <code className="rounded bg-black/25 px-1">VITE_API_BASE_URL</code> — ระบบเช็คชื่อจะเรียก API ไม่ได้
          <span className="mt-2 block text-amber-100/90">
            ถ้าต้องการดู UI การ์ดรายชื่อโดยไม่มี backend ให้ตั้ง{' '}
            <code className="rounded bg-black/25 px-1">VITE_USE_ATTENDANCE_MOCK=true</code> แล้วรีสตาร์ท dev server
          </span>
        </div>
      ) : null}

      {isAttendanceRollCallMockEnabled() ? (
        <div className="rounded-2xl border border-violet-400/40 bg-violet-950/40 p-4 text-sm text-violet-100 ring-1 ring-violet-400/25">
          <strong className="font-semibold text-white">โหมด mock:</strong> แสดงรายชื่อตัวอย่างจาก{' '}
          <code className="rounded bg-black/25 px-1">src/mocks/attendanceRollCallMock.ts</code> — ปุ่มบันทึกจะไม่ยิง API จริง
        </div>
      ) : null}

      {enabled && viewMode === 'history' && !historyAtValid ? (
        <div className="rounded-2xl border border-amber-400/35 bg-amber-950/30 p-4 text-sm text-amber-50 ring-1 ring-amber-400/20">
          เลือก<strong className="font-semibold text-white"> วันและเวลา </strong>ใน datetime picker ให้ครบ
          (รูปแบบ ปี-เดือน-วัน และชั่วโมง:นาที) แล้วระบบจะโหลดแผ่นเช็คชื่อให้อัตโนมัติ
        </div>
      ) : null}

      {enabled && query.isPending ? (
        <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/50 px-4 py-6 text-sm text-white/80 ring-1 ring-white/10">
          <Loader2 className="size-5 shrink-0 animate-spin text-orange-300" aria-hidden />
          {viewMode === 'history'
            ? 'กำลังโหลดแผ่นตามวัน-เวลาที่เลือก…'
            : rollScope === 'homeroom'
              ? 'กำลังโหลดหน้าแถว…'
              : 'กำลังโหลดจากตารางสอน…'}
        </div>
      ) : null}

      {enabled && query.isError ? (
        <div className="space-y-3 rounded-2xl border border-red-400/40 bg-red-950/45 p-4 text-sm text-red-100 ring-1 ring-red-400/25 backdrop-blur-sm">
          <p className="font-medium">โหลดข้อมูลไม่สำเร็จ</p>
          <p className="text-red-100/90">{errorMessage(query.error)}</p>
          {viewMode === 'smart' ? (
            <p className="text-xs text-red-100/75">
              ลองสลับเป็น &quot;ย้อนหลัง&quot; แล้วเลือกวัน-เวลาใน datetime picker เพื่อโหลดแผ่นย้อนหลัง หรือเปลี่ยนเป็นเช็คชื่อหน้าแถวถ้าคุณเป็นครูประจำชั้น
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
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
            <div className="rounded-2xl border border-emerald-400/35 bg-emerald-950/40 p-3 text-sm text-emerald-100 ring-1 ring-emerald-400/20">
              {saveOk}
            </div>
          ) : null}
          {saveErr ? (
            <div className="rounded-2xl border border-red-400/40 bg-red-950/45 p-3 text-sm text-red-100 ring-1 ring-red-400/25">
              {saveErr}
            </div>
          ) : null}

          <LegendStrip />

          {session.students.length === 0 ? (
            <div className="rounded-2xl border border-white/15 bg-slate-950/50 p-8 text-center text-sm text-white/65 ring-1 ring-white/10">
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

          <div className="flex flex-col gap-3 rounded-2xl border border-white/12 bg-slate-950/40 p-4 ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs leading-relaxed text-white/60">
              <p>
                <strong className="text-white/85">Bulk upsert:</strong> ทุกคนเริ่มที่ &quot;มาเรียน&quot;
                — แตะการ์ดเพื่อวนสถานะ มา → ขาด → สาย → ลา → โดดเรียน → มา
              </p>
              <p className="mt-1 text-white/50">
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
              className="inline-flex h-12 min-w-[11rem] shrink-0 items-center justify-center rounded-full border border-sky-400/50 bg-sky-500 px-6 text-sm font-semibold text-white shadow-md shadow-sky-950/40 transition-colors hover:bg-sky-400 disabled:pointer-events-none disabled:opacity-45"
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
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900/80 via-slate-950/80 to-slate-900/70 p-4 ring-1 ring-white/10 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.12em]',
              isHomeroom ? 'text-teal-200/90' : 'text-orange-200/90',
            )}
          >
            {kicker}
          </p>
          <p className="text-lg font-semibold tracking-tight text-white sm:text-xl">{session.classLabel}</p>
          {isHomeroom ? (
            <p className="text-sm text-white/75">
              {session.periodLabel ? (
                <span className="text-white/85">{session.periodLabel}</span>
              ) : (
                <span>รายชื่อห้องเรียน · ไม่ผูกวิชารายคาบ</span>
              )}
            </p>
          ) : session.subjectName ? (
            <p className="text-sm text-white/80">
              วิชา <span className="font-medium text-white">{session.subjectName}</span>
              {session.periodLabel ? (
                <>
                  {' '}
                  · <span className="text-white/90">{session.periodLabel}</span>
                </>
              ) : null}
            </p>
          ) : session.periodLabel ? (
            <p className="text-sm text-white/80">{session.periodLabel}</p>
          ) : null}
          {range ? <p className="text-xs tabular-nums text-white/55">{range}</p> : null}
        </div>
        <div className="shrink-0 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-white/45">วันที่ข้อมูล</p>
          <p className="text-sm font-semibold tabular-nums text-white">{session.sessionDate}</p>
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
    <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-slate-950/35 p-3 ring-1 ring-white/10">
      {items.map(({ s, label, hint }) => (
        <div
          key={s}
          className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-slate-900/40 px-2.5 py-1.5 text-xs text-white/85"
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
          <span className="truncate text-white/45">· {hint}</span>
        </div>
      ))}
    </div>
  )
}

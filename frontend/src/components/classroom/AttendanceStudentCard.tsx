import { useMemo } from 'react'

import { cn } from '@/lib/utils'
import { type AttendanceStatus, nextAttendanceStatus } from '@/services/attendanceService'

const STATUS_STRIP: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)]',
  absent: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
  late: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.35)]',
  leave: 'bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.35)]',
  cut_class: 'bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.45)]',
  unknown: 'bg-white/35',
}

const DOT_BG: Record<'present' | 'absent' | 'late' | 'leave' | 'cut_class', string> = {
  present: 'bg-emerald-500',
  absent: 'bg-rose-500',
  late: 'bg-amber-400',
  leave: 'bg-sky-500',
  cut_class: 'bg-violet-500',
}

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: 'มาเรียน',
  absent: 'ขาด',
  late: 'สาย',
  leave: 'ลา',
  cut_class: 'โดดเรียน',
  unknown: 'ไม่ระบุ',
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const a = parts[0]![0] ?? ''
    const b = parts[parts.length - 1]![0] ?? ''
    return (a + b).toUpperCase()
  }
  return (parts[0]?.slice(0, 2) ?? '?').toUpperCase()
}

type AttendanceStudentCardProps = {
  displayName: string
  seatNumber?: string | null
  avatarUrl?: string | null
  serverStatus: AttendanceStatus
  effectiveStatus: AttendanceStatus
  onAdvance: () => void
}

export function AttendanceStudentCard({
  displayName,
  seatNumber,
  avatarUrl,
  serverStatus,
  effectiveStatus,
  onAdvance,
}: AttendanceStudentCardProps) {
  const initials = useMemo(() => initialsFromName(displayName), [displayName])
  const changed = effectiveStatus !== serverStatus

  return (
    <button
      type="button"
      onClick={onAdvance}
      title={`${displayName} — ${STATUS_LABEL[effectiveStatus]} (กดเพื่อเปลี่ยนเป็น ${STATUS_LABEL[nextAttendanceStatus(effectiveStatus)]})`}
      aria-label={`เช็คชื่อ ${displayName} สถานะ ${STATUS_LABEL[effectiveStatus]} กดเพื่อเปลี่ยน`}
      className={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-2xl border text-left transition',
        'min-h-[132px] touch-manipulation',
        'border-white/15 bg-slate-950/55 ring-1 ring-white/10',
        'hover:border-orange-400/40 hover:bg-slate-900/65 hover:ring-orange-400/25',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        changed && 'border-orange-400/35 ring-orange-400/20',
      )}
    >
      <div
        className={cn('absolute inset-y-0 left-0 w-1.5', STATUS_STRIP[effectiveStatus])}
        aria-hidden
      />

      <div className="flex flex-1 flex-col gap-2.5 pl-4 pr-3 pt-3 pb-3">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="size-14 rounded-2xl border border-white/15 object-cover shadow-inner sm:size-16"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="grid size-14 place-items-center rounded-2xl border border-white/15 bg-gradient-to-br from-slate-700/90 to-slate-900/90 text-base font-semibold text-white shadow-inner sm:size-16 sm:text-lg">
                {initials}
              </div>
            )}
            <div
              className="absolute -bottom-1 -right-1 flex gap-0.5 rounded-full border border-white/20 bg-slate-950/90 px-1 py-0.5"
              aria-hidden
            >
              {(['present', 'absent', 'late', 'leave', 'cut_class'] as const).map((dot) => (
                <span
                  key={dot}
                  className={cn(
                    'size-1.5 shrink-0 rounded-full transition-opacity',
                    dot === effectiveStatus ? cn('opacity-100', DOT_BG[dot]) : 'bg-white/25 opacity-35',
                  )}
                />
              ))}
            </div>
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-[0.95rem]">
              {displayName}
            </p>
            {seatNumber ? (
              <p className="mt-1 text-xs font-medium text-white/55">เลขที่ {seatNumber}</p>
            ) : (
              <p className="mt-1 text-xs text-white/40">—</p>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/10 pt-2">
          <span
            className={cn(
              'inline-flex max-w-[70%] truncate rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
              effectiveStatus === 'present' && 'bg-emerald-500/15 text-emerald-100 ring-emerald-400/30',
              effectiveStatus === 'absent' && 'bg-rose-500/15 text-rose-100 ring-rose-400/30',
              effectiveStatus === 'late' && 'bg-amber-500/15 text-amber-100 ring-amber-400/30',
              effectiveStatus === 'leave' && 'bg-sky-500/15 text-sky-100 ring-sky-400/30',
              effectiveStatus === 'cut_class' && 'bg-violet-500/15 text-violet-100 ring-violet-400/35',
              effectiveStatus === 'unknown' && 'bg-white/10 text-white/70 ring-white/15',
            )}
          >
            {STATUS_LABEL[effectiveStatus]}
          </span>
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-white/35 group-hover:text-orange-200/80">
            แตะเปลี่ยน
          </span>
        </div>
      </div>
    </button>
  )
}

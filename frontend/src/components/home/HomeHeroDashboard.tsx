import { ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type HeroSlide = {
  id: string
  eyebrow: string
  title: string
  description: string
  panel: ReactNode
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint: string
  accent: 'sky' | 'emerald' | 'amber' | 'violet'
}) {
  const accentRing =
    accent === 'sky'
      ? 'ring-sky-400/35'
      : accent === 'emerald'
        ? 'ring-emerald-400/35'
        : accent === 'amber'
          ? 'ring-amber-400/35'
          : 'ring-violet-400/35'
  const accentBar =
    accent === 'sky'
      ? 'bg-sky-400/90'
      : accent === 'emerald'
        ? 'bg-emerald-400/90'
        : accent === 'amber'
          ? 'bg-amber-400/90'
          : 'bg-violet-400/90'

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/15 bg-slate-900/55 p-3 shadow-inner ring-1 backdrop-blur-sm sm:p-4',
        accentRing,
      )}
    >
      <div className={cn('mb-2 h-1 w-10 rounded-full', accentBar)} aria-hidden />
      <p className="text-[11px] font-medium uppercase tracking-wide text-white/55 sm:text-xs">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-white sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-white/65">{hint}</p>
    </div>
  )
}

function SlideOverviewPanel() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard label="งานที่ส่งแล้ว" value="12" hint="สัปดาห์นี้" accent="sky" />
      <StatCard label="รอตรวจ" value="3" hint="ครูที่ปรึกษา" accent="amber" />
      <StatCard label="คะแนนเฉลี่ย" value="88" hint="รายวิชาหลัก" accent="emerald" />
    </div>
  )
}

function SlideSchedulePanel() {
  const rows = [
    { subject: 'คณิตศาสตร์', task: 'แบบฝึกหัด บทที่ 4', due: 'พรุ่งนี้', tone: 'bg-amber-500/85' },
    { subject: 'วิทยาศาสตร์', task: 'รายงานห้องปฏิบัติการ', due: '3 วัน', tone: 'bg-sky-500/85' },
    { subject: 'ภาษาไทย', task: 'เรียงความเรื่องครอบครัว', due: 'สัปดาห์หน้า', tone: 'bg-emerald-500/85' },
  ] as const

  return (
    <div className="space-y-2 rounded-2xl border border-white/15 bg-slate-900/50 p-3 ring-1 ring-white/10 sm:p-4">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <p className="text-sm font-semibold text-white">งานที่ใกล้ครบกำหนด</p>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/75">
          อัปเดตล่าสุด
        </span>
      </div>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={r.subject}
            className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5"
          >
            <span className={cn('size-2 shrink-0 rounded-full', r.tone)} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{r.subject}</p>
              <p className="truncate text-xs text-white/65">{r.task}</p>
            </div>
            <span className="shrink-0 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/85">
              {r.due}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SlideProgressPanel() {
  const bars = [
    { label: 'การบ้าน', pct: 78 },
    { label: 'โครงงานกลุ่ม', pct: 54 },
    { label: 'การอ่านเสริม', pct: 92 },
  ] as const

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/15 bg-slate-900/50 p-4 ring-1 ring-violet-400/25">
        <p className="text-sm font-semibold text-white">ความสม่ำเสมอ</p>
        <p className="mt-1 text-xs text-white/65">สะท้อนการเข้าเรียนและส่งงาน 7 วันล่าสุด</p>
        <div
          className="relative mx-auto mt-5 grid size-36 place-items-center rounded-full border border-white/15 bg-slate-950/50 sm:size-40"
          style={{
            background:
              'conic-gradient(rgb(56 189 248 / 0.95) 0% 72%, rgb(255 255 255 / 0.08) 72% 100%)',
          }}
        >
          <div className="grid size-[76%] place-items-center rounded-full border border-white/10 bg-slate-950/80 shadow-inner sm:size-[78%]">
            <div className="text-center">
              <p className="text-3xl font-semibold tabular-nums text-white sm:text-4xl">72%</p>
              <p className="text-[11px] text-white/60">เฉลี่ยรายสัปดาห์</p>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3 rounded-2xl border border-white/15 bg-slate-900/50 p-4 ring-1 ring-white/10">
        <p className="text-sm font-semibold text-white">ความคืบหน้าตามหัวข้อ</p>
        <ul className="space-y-3">
          {bars.map((b) => (
            <li key={b.label}>
              <div className="flex items-center justify-between gap-2 text-xs text-white/75">
                <span>{b.label}</span>
                <span className="tabular-nums text-white/90">{b.pct}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                  style={{ width: `${b.pct}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const SLIDES: HeroSlide[] = [
  {
    id: 'overview',
    eyebrow: 'Dashboard',
    title: 'ภาพรวมการเรียนในมุมมองเดียว',
    description: 'ดูงาน คะแนน และสถานะล่าสุดแบบจัดระเบียบ เหมาะทั้งครูและนักเรียน',
    panel: <SlideOverviewPanel />,
  },
  {
    id: 'tasks',
    eyebrow: 'งานและกำหนดส่ง',
    title: 'โฟกัสสิ่งที่ต้องทำต่อไป',
    description: 'จัดลำดับความสำคัญจากกำหนดส่งและความเร่งด่วน ลดความพลาดในช่วงสอบ',
    panel: <SlideSchedulePanel />,
  },
  {
    id: 'progress',
    eyebrow: 'ความก้าวหน้า',
    title: 'ติดตามนิสัยการเรียนอย่างเป็นรูปธรรม',
    description: 'มองเห็นแนวโน้มและจุดที่ควรปรับปรุงได้ชัดเจนขึ้น',
    panel: <SlideProgressPanel />,
  },
]

export function HomeHeroDashboard() {
  const carouselId = useId()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduceMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const count = SLIDES.length

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => (i + dir + count) % count)
    },
    [count],
  )

  useEffect(() => {
    if (reduceMotion || paused) return
    const t = window.setInterval(() => go(1), 7000)
    return () => window.clearInterval(t)
  }, [go, paused, reduceMotion])

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-950/55 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)] ring-1 ring-white/10 backdrop-blur-md sm:rounded-3xl"
      aria-labelledby={`${carouselId}-heading`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current
        touchStartX.current = null
        if (start == null) return
        const end = e.changedTouches[0]?.clientX
        if (end == null) return
        const dx = end - start
        if (Math.abs(dx) < 40) return
        go(dx < 0 ? 1 : -1)
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(56,189,248,0.14),transparent_55%),radial-gradient(ellipse_at_90%_30%,rgba(251,146,60,0.12),transparent_50%)]" />

      <div className="relative p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 shadow-inner ring-1 ring-white/10 sm:size-12">
              <LayoutDashboard className="size-5 text-sky-200 sm:size-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-200/90 sm:text-xs">
                Krusa Club — Landing
              </p>
              <h2
                id={`${carouselId}-heading`}
                className="mt-0.5 text-lg font-semibold tracking-tight text-white sm:text-xl"
              >
                แดชบอร์ดสไตล์สไลด์
              </h2>
              <p className="mt-1 max-w-prose text-sm leading-relaxed text-white/75">
                สำรวจมุมมองตัวอย่างของระบบจัดการชั้นเรียน — สลับสไลด์เพื่อดูบริบทที่ต่างกัน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-center sm:self-start">
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-xl border border-white/20 bg-slate-900/60 text-white shadow-inner ring-1 ring-white/10 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              aria-label="สไลด์ก่อนหน้า"
              onClick={() => go(-1)}
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-xl border border-white/20 bg-slate-900/60 text-white shadow-inner ring-1 ring-white/10 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              aria-label="สไลด์ถัดไป"
              onClick={() => go(1)}
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/12 bg-slate-900/35 ring-1 ring-white/10">
          <div
            className={cn('flex', !reduceMotion && 'transition-transform duration-500 ease-out')}
            style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
          >
            {SLIDES.map((slide, i) => (
              <div
                key={slide.id}
                id={`${carouselId}-slide-${slide.id}`}
                className="min-w-full shrink-0 px-4 py-5 sm:px-6 sm:py-6"
                aria-hidden={i !== index}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-300/95 sm:text-xs">
                  {slide.eyebrow}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  {slide.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/78">{slide.description}</p>
                <div className="mt-5">{slide.panel}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="flex flex-wrap justify-center gap-2 sm:justify-start"
            role="tablist"
            aria-label="เลือกสไลด์แดชบอร์ด"
          >
            {SLIDES.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-controls={`${carouselId}-slide-${slide.id}`}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400',
                  i === index
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-950/40'
                    : 'bg-white/10 text-white/80 hover:bg-white/15',
                )}
                onClick={() => setIndex(i)}
              >
                {slide.eyebrow}
              </button>
            ))}
          </div>
          <p className="text-center text-[11px] text-white/50 sm:text-right">
            {reduceMotion ? 'โหมดลดการเคลื่อนไหว — ไม่เลื่อนอัตโนมัติ' : paused ? 'หยุดชั่วคราวขณะชี้เมาส์' : 'เลื่อนอัตโนมัติทุก 7 วินาที'}
          </p>
        </div>
      </div>
    </section>
  )
}

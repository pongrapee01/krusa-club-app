import { cn } from '@/lib/utils'

/** Clean Adventure Learning — reusable class bundles (ไม่เปลี่ยน layout) */
export const ed = {
  /** #0F172A — หัวข้อ / เนื้อหาหลัก */
  text: 'text-slate-900',
  /** #64748B — คำอธิบายรอง */
  textSub: 'text-slate-600',
  /** ข้อความจาง / meta */
  textMuted: 'text-slate-500',
  textHint: 'text-slate-400',
  textLink: 'text-blue-600 hover:text-blue-700',
  textError: 'text-rose-600',
  textSuccess: 'text-emerald-700',
  textWarning: 'text-amber-800',

  pageTitle: 'text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl',
  pageLead: 'max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base',
  sectionTitle: 'text-lg font-semibold text-slate-900',
  sectionLead: 'text-sm leading-relaxed text-slate-600',
  labelCaps: 'text-xs font-medium uppercase tracking-wide text-slate-500',
  code: 'rounded-lg bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-800 ring-1 ring-slate-200',

  surface:
    'rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]',
  surfaceSoft: 'rounded-2xl border border-slate-200/90 bg-white/95 shadow-sm',
  surfaceInner: 'rounded-xl border border-slate-100 bg-slate-50/80',

  input:
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/25',
  select:
    'h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/25',

  btnPrimary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-500 active:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:ring-offset-2',
  btnSecondary:
    'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/30',
  btnAccent:
    'inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/80 bg-amber-400 px-5 text-sm font-semibold text-amber-950 shadow-sm transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40',
  btnSuccess:
    'inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/60 bg-emerald-500 px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/15 transition hover:bg-emerald-400 active:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40',
  /** ปุ่มเพิ่มรายการ — เฉพาะไอคอน (label ผ่าน aria-label / title) */
  btnIconSuccess:
    'inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/60 bg-emerald-500 text-white shadow-sm shadow-emerald-600/15 transition hover:bg-emerald-400 active:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 disabled:pointer-events-none disabled:opacity-45',

  btnGhost:
    'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/30',
  btnDangerGhost:
    'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50',

  tableWrap:
    'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]',
  tableHead: 'border-b border-slate-200 bg-slate-50/90',
  tableHeadCell:
    'whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-4',
  tableRow: 'transition-colors hover:bg-slate-50/80',
  tableCell: 'px-3 py-3 align-middle text-slate-700 sm:px-4',

  badge: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',

  actionView:
    'inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-50',
  actionEdit:
    'inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50',
  actionDanger:
    'inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40',
  label: 'text-xs font-medium text-slate-600',
} as const

export function edCard(className?: string) {
  return cn(ed.surface, className)
}

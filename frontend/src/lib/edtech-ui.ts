import { cn } from '@/lib/utils'

/** hover ยกตัว / กดยุบ — ใช้กับปุ่มที่มีมิติ */
export const edPress =
  'transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45'

/**
 * Clean Adventure Learning — reusable class bundles
 * UI v2: โทนสีเดิม + มีมิติ (เงาหลายชั้น `shadow-ed-*` ใน index.css) + ขอบมน (การ์ด 28px, ปุ่ม/ช่องกรอกแคปซูล)
 */
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
  code: 'rounded-full bg-slate-100 px-2 py-0.5 font-mono text-sm text-slate-800 ring-1 ring-slate-200',

  surface:
    'rounded-[28px] border border-white/80 bg-gradient-to-b from-white to-slate-50/70 shadow-ed-card',
  /** การ์ดที่คลิกได้ — ลอยขึ้นเมื่อ hover */
  surfaceHover:
    'rounded-[28px] border border-white/80 bg-gradient-to-b from-white to-slate-50/70 shadow-ed-card transition-all duration-300 hover:-translate-y-1 hover:shadow-ed-card-hover',
  surfaceSoft: 'rounded-[28px] border border-white/80 bg-white/95 shadow-ed-raised',
  surfaceInner: 'rounded-3xl border border-slate-100 bg-white shadow-ed-raised',

  input:
    'h-12 w-full rounded-full border border-slate-200 bg-slate-50/80 px-5 text-sm text-slate-900 shadow-ed-inset placeholder:text-slate-400 transition focus-visible:border-blue-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/20',
  textarea:
    'w-full rounded-3xl border border-slate-200 bg-slate-50/80 px-5 py-3 text-sm text-slate-900 shadow-ed-inset placeholder:text-slate-400 transition focus-visible:border-blue-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/20',
  select:
    'h-12 rounded-full border border-slate-200 bg-slate-50/80 px-5 text-sm text-slate-900 shadow-ed-inset focus-visible:border-blue-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/20',

  btnPrimary: cn(
    'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 px-6 text-sm font-semibold text-white shadow-ed-btn-primary hover:from-blue-400 hover:to-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/30',
    edPress,
  ),
  btnSecondary: cn(
    'inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-6 text-sm font-semibold text-slate-700 shadow-ed-btn-soft hover:border-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/20',
    edPress,
  ),
  btnAccent: cn(
    'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-amber-400 to-amber-500 px-6 text-sm font-semibold text-amber-950 shadow-ed-btn-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/30',
    edPress,
  ),
  btnSuccess: cn(
    'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500 px-6 text-sm font-semibold text-white shadow-ed-btn-success focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/30',
    edPress,
  ),
  /** ปุ่มเพิ่มรายการ — เฉพาะไอคอน (label ผ่าน aria-label / title) */
  btnIconSuccess: cn(
    'inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500 text-white shadow-ed-btn-success focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/30',
    edPress,
  ),

  btnGhost:
    'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:shadow-ed-raised focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/20',
  btnDangerGhost: cn(
    'inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-rose-600 ring-1 ring-rose-200 shadow-ed-raised hover:bg-rose-50',
    edPress,
  ),

  tableWrap: 'overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-ed-card',
  tableHead: 'border-b border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/70',
  tableHeadCell:
    'whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-4',
  tableRow: 'transition-colors hover:bg-blue-50/50',
  tableCell: 'px-3 py-3 align-middle text-slate-700 sm:px-4',

  badge: 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 shadow-sm',

  actionView: cn(
    'inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200 shadow-ed-raised hover:bg-blue-50',
    edPress,
  ),
  actionEdit: cn(
    'inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 shadow-ed-raised hover:bg-slate-50',
    edPress,
  ),
  actionDanger: cn(
    'inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-rose-600 ring-1 ring-rose-200 shadow-ed-raised hover:bg-rose-50 disabled:cursor-not-allowed',
    edPress,
  ),
  label: 'text-xs font-medium text-slate-600',
} as const

export function edCard(className?: string) {
  return cn(ed.surface, className)
}

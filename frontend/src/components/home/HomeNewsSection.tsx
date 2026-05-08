import { ArrowUpRight, Newspaper } from 'lucide-react'
import { useId, useState } from 'react'

import { cn } from '@/lib/utils'

type NewsItem = {
  id: string
  title: string
  date: string
  excerpt: string
  tag: string
  accent: 'sky' | 'emerald' | 'amber' | 'violet' | 'rose'
}

type NewsTab = {
  id: string
  label: string
  description: string
  items: NewsItem[]
}

const NEWS_TABS: NewsTab[] = [
  {
    id: 'highlights',
    label: 'ข่าวเด่น',
    description: 'เรื่องราวและนโยบายที่ส่งผลต่อชุมชนโรงเรียน',
    items: [
      {
        id: 'h1',
        title: 'เปิดรับสมัครชมรมภาคเรียนที่ 2',
        date: '28 เม.ย. 2569',
        excerpt: 'นักเรียนสามารถเลือกชมรมใหม่ได้ตามความถนัด พร้อมคิวปรึกษาครูที่ปรึกษาชมรม',
        tag: 'ลงทะเบียน',
        accent: 'sky',
      },
      {
        id: 'h2',
        title: 'อัปเกรดห้องสมุดดิจิทัล — ค้นหางานวิจัยได้เร็วขึ้น',
        date: '22 เม.ย. 2569',
        excerpt: 'ระบบแนะนำเอกสารตามวิชาและระดับชั้น ลดเวลาเตรียมโครงงาน',
        tag: 'เทคโนโลยี',
        accent: 'violet',
      },
      {
        id: 'h3',
        title: 'แนวทางความปลอดภัยบนอินเทอร์เน็ตสำหรับนักเรียน',
        date: '18 เม.ย. 2569',
        excerpt: 'สรุปแนวปฏิบัติเรื่องรหัสผ่าน การแชร์ข้อมูล และการรายงานพฤติกรรมเสี่ยง',
        tag: 'ความปลอดภัย',
        accent: 'emerald',
      },
    ],
  },
  {
    id: 'announcements',
    label: 'ประกาศ',
    description: 'ประกาศทางการ ตาราง และข้อมูลสำคัญจากฝ่ายบริหาร',
    items: [
      {
        id: 'a1',
        title: 'หยุดเรียนชดเชยวันหยุดราชการ (ฉบับแก้ไข)',
        date: '15 เม.ย. 2569',
        excerpt: 'กำหนดวันชดเชยและห้องสอบเสริมสำหรับนักเรียนที่ลาป่วยยาว',
        tag: 'ตาราง',
        accent: 'amber',
      },
      {
        id: 'a2',
        title: 'รับสมัครตัวแทนนักเรียน — ปิดรับ 5 พ.ค.',
        date: '10 เม.ย. 2569',
        excerpt: 'ยื่นใบสมัครออนไลน์และสัมภาษณ์สั้น ๆ กับคณะกรรมการนักเรียน',
        tag: 'ด่วน',
        accent: 'rose',
      },
      {
        id: 'a3',
        title: 'แจ้งเตือน: ปิดระบบลงทะเบียนวิชาเสรีชั่วคราว',
        date: '8 เม.ย. 2569',
        excerpt: 'บำรุงรักษาระบบในช่วง 02:00–05:00 น. ของวันที่กำหนด',
        tag: 'ระบบ',
        accent: 'sky',
      },
    ],
  },
  {
    id: 'events',
    label: 'กิจกรรม',
    description: 'งานวันสำคัญ การแข่งขัน และกิจกรรมพัฒนาผู้เรียน',
    items: [
      {
        id: 'e1',
        title: 'Krusa Science Fair — รอบคัดเลือกโรงเรียน',
        date: '12 พ.ค. 2569',
        excerpt: 'โชว์โครงงาน 3 นาที + Q&A กับคณะกรรมการวิชาการ',
        tag: 'แข่งขัน',
        accent: 'violet',
      },
      {
        id: 'e2',
        title: 'วันเปิดบ้านชมรม — ลงทะเบียนล่วงหน้า',
        date: '3 พ.ค. 2569',
        excerpt: 'ทัวร์บูธชมรม กิจกรรมสาธิต และของที่ระลึกจำกัดจำนวน',
        tag: 'ชุมชน',
        accent: 'emerald',
      },
      {
        id: 'e3',
        title: 'เวิร์กช็อปการนำเสนอด้วยสไลด์อย่างมืออาชีพ',
        date: '25 เม.ย. 2569',
        excerpt: 'สำหรับนักเรียนม.ปลาย จำกัด 40 ที่นั่ง ลงทะเบียนผ่านลิงก์ภายใน',
        tag: 'เวิร์กช็อป',
        accent: 'amber',
      },
    ],
  },
]

function accentClasses(accent: NewsItem['accent']) {
  switch (accent) {
    case 'emerald':
      return 'from-emerald-400/35 to-emerald-950/20 ring-emerald-400/25'
    case 'amber':
      return 'from-amber-400/35 to-amber-950/20 ring-amber-400/25'
    case 'violet':
      return 'from-violet-400/35 to-violet-950/20 ring-violet-400/25'
    case 'rose':
      return 'from-rose-400/35 to-rose-950/20 ring-rose-400/25'
    default:
      return 'from-sky-400/35 to-sky-950/20 ring-sky-400/25'
  }
}

function tagChipClasses(accent: NewsItem['accent']) {
  switch (accent) {
    case 'emerald':
      return 'bg-emerald-500/20 text-emerald-100 ring-emerald-400/30'
    case 'amber':
      return 'bg-amber-500/20 text-amber-100 ring-amber-400/30'
    case 'violet':
      return 'bg-violet-500/20 text-violet-100 ring-violet-400/30'
    case 'rose':
      return 'bg-rose-500/20 text-rose-100 ring-rose-400/30'
    default:
      return 'bg-sky-500/20 text-sky-100 ring-sky-400/30'
  }
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950/40 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.65)] ring-1 ring-white/10 backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5 hover:border-white/25',
      )}
    >
      <div
        className={cn(
          'relative h-28 bg-gradient-to-br sm:h-32',
          accentClasses(item.accent),
          'ring-1 ring-inset',
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_45%)]" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <span
            className={cn(
              'inline-flex max-w-[70%] truncate rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 backdrop-blur-sm',
              tagChipClasses(item.accent),
            )}
          >
            {item.tag}
          </span>
          <span className="shrink-0 rounded-lg bg-slate-950/45 px-2 py-1 text-[11px] font-medium text-white/85 ring-1 ring-white/15">
            {item.date}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold leading-snug tracking-tight text-white sm:text-[1.05rem]">
          <span className="line-clamp-2">{item.title}</span>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-white/72 line-clamp-3">{item.excerpt}</p>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-300 transition-colors group-hover:text-orange-200"
        >
          อ่านเพิ่มเติม
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </div>
    </article>
  )
}

export function HomeNewsSection() {
  const baseId = useId()
  const [tab, setTab] = useState(0)
  const active = NEWS_TABS[tab] ?? NEWS_TABS[0]

  return (
    <section
      className="rounded-2xl border border-white/20 bg-slate-950/45 p-4 shadow-lg shadow-black/30 ring-1 ring-white/10 backdrop-blur-md sm:rounded-3xl sm:p-6"
      aria-labelledby={`${baseId}-news-heading`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 shadow-inner ring-1 ring-white/10 sm:size-12">
            <Newspaper className="size-5 text-orange-200 sm:size-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 id={`${baseId}-news-heading`} className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              ข่าวสารและประกาศ
            </h2>
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-white/75">
              เลือกหมวดเพื่อดูข่าวย่อยในรูปแบบการ์ด — ออกแบบให้อ่านง่ายบนทุกขนาดหน้าจอ
            </p>
          </div>
        </div>
      </div>

      <div
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/12 bg-slate-900/40 p-1.5 ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between"
        role="tablist"
        aria-label="หมวดข่าวสาร"
      >
        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          {NEWS_TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${t.id}`}
              aria-selected={i === tab}
              aria-controls={`${baseId}-panel-${t.id}`}
              className={cn(
                'rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:px-4',
                i === tab
                  ? 'bg-orange-600 text-white shadow-sm ring-1 ring-orange-400/45'
                  : 'text-white/80 hover:bg-white/10 hover:text-white',
              )}
              onClick={() => setTab(i)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="px-2 pb-1 text-xs leading-relaxed text-white/60 sm:max-w-md sm:pb-0 sm:text-right">
          {active.description}
        </p>
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${active.id}`}
        aria-labelledby={`${baseId}-tab-${active.id}`}
        className="mt-5"
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.items.map((item) => (
            <li key={item.id}>
              <NewsCard item={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

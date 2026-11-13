import { Link } from 'react-router-dom'

import { HomeHeroDashboard } from '@/components/home/HomeHeroDashboard'
import { HomeNewsSection } from '@/components/home/HomeNewsSection'
import { ed } from '@/lib/edtech-ui'
import { cn } from '@/lib/utils'

export function HomePage() {
  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600 sm:text-xs">
          Krusa Club
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
          ยินดีต้อนรับสู่แพลตฟอร์มโรงเรียน
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          จัดการชั้นเรียน งานมอบหมาย และติดตามความก้าวหน้า — ออกแบบให้ใช้งานสบายทั้งบนมือถือและเดสก์ท็อป
        </p>
      </header>

      <HomeHeroDashboard />

      <HomeNewsSection />

      <section className={cn(ed.surface, 'p-4 sm:p-6')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h2 className={ed.sectionTitle}>พร้อมเริ่มใช้งาน</h2>
            <p className={ed.sectionLead}>
              เข้าสู่ระบบเพื่อเปิดเมนูตามสิทธิ์ หรือสมัครสมาชิกใหม่เพื่อเริ่มต้น
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link className={cn(ed.btnPrimary, 'min-h-[44px] touch-manipulation')} to="/login">
              เข้าสู่ระบบ
            </Link>
            <Link className={cn(ed.btnSecondary, 'min-h-[44px] touch-manipulation')} to="/register">
              ลงทะเบียน
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

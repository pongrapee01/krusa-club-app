import { Link } from 'react-router-dom'

import { HomeHeroDashboard } from '@/components/home/HomeHeroDashboard'
import { HomeNewsSection } from '@/components/home/HomeNewsSection'

export function HomePage() {
  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200/90 sm:text-xs">
          Krusa Club
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
          ยินดีต้อนรับสู่แพลตฟอร์มโรงเรียน
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-white/80 sm:text-base">
          จัดการชั้นเรียน งานมอบหมาย และติดตามความก้าวหน้า — ออกแบบให้ใช้งานสบายทั้งบนมือถือและเดสก์ท็อป
        </p>
      </header>

      <HomeHeroDashboard />

      <HomeNewsSection />

      <section className="rounded-2xl border border-white/18 bg-gradient-to-br from-slate-950/70 via-slate-900/55 to-slate-950/70 p-4 shadow-lg shadow-black/30 ring-1 ring-white/10 backdrop-blur-md sm:rounded-3xl sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h2 className="text-lg font-semibold text-white sm:text-xl">พร้อมเริ่มใช้งาน</h2>
            <p className="text-sm text-white/75">
              เข้าสู่ระบบเพื่อเปิดเมนูตามสิทธิ์ หรือสมัครสมาชิกใหม่เพื่อเริ่มต้น
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-green-400/45 bg-green-600 px-5 text-sm font-semibold text-white shadow-md shadow-green-950/35 transition-colors hover:bg-green-500 active:bg-green-700 touch-manipulation"
              to="/login"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/15 active:bg-white/20 touch-manipulation"
              to="/register"
            >
              ลงทะเบียน
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

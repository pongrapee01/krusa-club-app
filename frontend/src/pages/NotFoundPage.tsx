import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col justify-center px-4 py-10 font-sans text-white">
      <div className="mx-auto w-full max-w-lg space-y-4">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">ไม่พบหน้านี้</h1>
        <p className="text-sm leading-relaxed text-white/85 sm:text-base">
          ลิงก์อาจไม่ถูกต้อง หรือหน้านี้ถูกย้าย
        </p>
        <Link
          className="inline-flex min-h-[44px] max-w-full items-center justify-center rounded-full border border-white/35 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-400/25 active:bg-orange-600 touch-manipulation"
          to="/"
        >
          กลับหน้าแรก
        </Link>
      </div>
    </div>
  )
}

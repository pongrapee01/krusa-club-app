import { Link } from 'react-router-dom'

import { ed } from '@/lib/edtech-ui'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col justify-center px-4 py-10">
      <div className="mx-auto w-full max-w-lg space-y-4">
        <h1 className={ed.pageTitle}>ไม่พบหน้านี้</h1>
        <p className={ed.pageLead}>ลิงก์อาจไม่ถูกต้อง หรือหน้านี้ถูกย้าย</p>
        <Link className={ed.btnPrimary} to="/">
          กลับหน้าแรก
        </Link>
      </div>
    </div>
  )
}

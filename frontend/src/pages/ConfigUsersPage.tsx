import { Link } from 'react-router-dom'

export function ConfigUsersPage() {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">User Management</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            หน้าบริหารจัดการผู้ใช้งาน เพิ่ม แก้ไข และกำหนดสถานะการใช้งานของบัญชีในระบบ
          </p>
        </div>
        <Link
          to="/register"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-sky-400/50 bg-sky-500 px-5 text-sm font-semibold text-white shadow-md shadow-sky-950/35 transition-colors hover:bg-sky-400 active:bg-sky-600 sm:h-10"
        >
          ลงทะเบียนผู้ใช้ใหม่
        </Link>
      </div>
    </section>
  )
}

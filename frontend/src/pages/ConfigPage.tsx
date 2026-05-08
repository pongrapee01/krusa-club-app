import { Link } from 'react-router-dom'

export function ConfigPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Configuration</h1>
      <p className="text-sm leading-relaxed text-white/85 sm:text-base">
        ศูนย์รวมการตั้งค่าระบบ เลือกเมนูย่อยจากแถบด้านซ้ายหรือเข้าผ่านลิงก์ลัดด้านล่าง
      </p>
      <div className="flex flex-wrap gap-2">
        <Link className="rounded-lg border border-white/25 px-3 py-2 text-sm hover:bg-white/10" to="/config/master">
          Master and Data
        </Link>
        <Link className="rounded-lg border border-white/25 px-3 py-2 text-sm hover:bg-white/10" to="/config/users">
          User Management
        </Link>
        <Link
          className="rounded-lg border border-white/25 px-3 py-2 text-sm hover:bg-white/10"
          to="/config/permissions"
        >
          Permission
        </Link>
      </div>
    </section>
  )
}

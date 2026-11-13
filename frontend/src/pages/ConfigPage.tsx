import { ed } from '@/lib/edtech-ui'

export function ConfigPage() {
  return (
    <section className="space-y-4">
      <h1 className={ed.pageTitle}>Configuration</h1>
      <p className={ed.pageLead}>
        ศูนย์ตั้งค่าระบบ — เลือกเมนูย่อยจากแถบด้านซ้ายเพื่อจัดการผู้ใช้ Master Data และสิทธิ์
      </p>
    </section>
  )
}

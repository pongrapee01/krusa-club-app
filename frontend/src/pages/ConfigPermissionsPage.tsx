import { ed } from '@/lib/edtech-ui'

export function ConfigPermissionsPage() {
  return (
    <section className="space-y-4">
      <h1 className={ed.pageTitle}>Permission</h1>
      <p className={ed.pageLead}>
        กำหนดบทบาทและสิทธิ์การเข้าถึง — เนื้อหาจริงจะเชื่อมกับ API ในขั้นถัดไป
      </p>
    </section>
  )
}

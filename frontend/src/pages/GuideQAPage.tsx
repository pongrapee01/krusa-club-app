import { ed } from '@/lib/edtech-ui'
import { cn } from '@/lib/utils'

export function GuideQAPage() {
  return (
    <section className="space-y-4">
      <h1 className={ed.pageTitle}>Q&amp;A</h1>
      <p className={ed.pageLead}>
        ตัวอย่างหน้าคำถาม–คำตอบภายใต้เมนู <strong className={ed.text}>Guide</strong>
      </p>
      <div className={cn(ed.surface, 'p-4 sm:p-5')}>
        <p className="font-medium text-slate-900">แนวทางรีวิว</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 sm:text-base">
          <li>ตรวจสอบว่า route ตรงกับเมนูใน navigation</li>
          <li>ทดสอบ responsive และ accessibility</li>
        </ul>
      </div>
    </section>
  )
}

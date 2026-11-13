import { ed } from '@/lib/edtech-ui'

export function GuideManualPage() {
  return (
    <section className="space-y-4">
      <h1 className={ed.pageTitle}>คู่มือ</h1>
      <p className={ed.pageLead}>
        ตัวอย่างหน้าภายใต้เมนู <strong className={ed.text}>Guide</strong> — เนื้อหาคู่มือจริงใส่แทนที่ได้ที่นี่
      </p>
      <ul className="list-inside list-disc space-y-2 text-sm text-slate-700 sm:text-base">
        <li>
          Route: <code className={ed.code}>/guide</code>
        </li>
        <li>
          เมนูจาก <code className={ed.code}>navigation.ts</code>
        </li>
      </ul>
    </section>
  )
}

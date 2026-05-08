export function GuideManualPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">คู่มือ</h1>
      <p className="text-sm leading-relaxed text-white/85 sm:text-base">
        ตัวอย่างหน้าภายใต้เมนู <strong className="font-semibold text-white">Guide</strong> — เนื้อหาคู่มือจริงใส่แทนที่ได้ที่นี่
      </p>
      <ul className="list-inside list-disc space-y-2 text-sm text-white/90 sm:text-base">
        <li>
          โครงสร้าง route:{' '}
          <code className="rounded bg-white/15 px-1.5 py-0.5 text-white">/guide</code>
        </li>
        <li>
          เมนูย่อยซ้ายมาจาก{' '}
          <code className="rounded bg-white/15 px-1.5 py-0.5 text-white">navigation.ts</code>
        </li>
      </ul>
    </div>
  )
}

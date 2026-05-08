export function GuideQAPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Q&amp;A</h1>
      <p className="text-sm leading-relaxed text-white/85 sm:text-base">
        ตัวอย่างหน้าคำถาม–คำตอบภายใต้เมนู <strong className="font-semibold text-white">Guide</strong>
      </p>
      <div className="rounded-2xl border border-white/20 bg-slate-950/45 p-4 text-sm text-white/90 shadow-lg shadow-black/20 ring-1 ring-white/10 backdrop-blur-md sm:text-base">
        <p className="font-medium text-white">แนวทางรีวิว</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-white/85">
          <li>เชื่อม FAQ จาก CMS หรือ markdown ภายหลัง</li>
          <li>แยกหมวดด้วย anchor หรือ route ลึกลงไปอีกระดับได้</li>
        </ul>
      </div>
    </div>
  )
}

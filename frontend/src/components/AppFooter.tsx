export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-slate-200 bg-white/85 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6">
        <p className="text-xs text-slate-500">© {year} Krusa Club. All rights reserved.</p>
        <p className="text-center text-xs text-slate-400 sm:text-right">
          ถึงเป้าหมายยังอยู่อีกไกล เดินไปพักไป...ยังไงก็ถึง
        </p>
      </div>
    </footer>
  )
}

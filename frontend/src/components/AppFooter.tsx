export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-white/15 bg-slate-950/55 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center justify-between gap-1 px-4 py-3 sm:flex-row sm:px-6">
        <p className="text-xs text-white/50">
          © {year} Krusa Club. All rights reserved.
        </p>
        <p className="text-xs text-white/35">
          Built with React · Supabase · ASP.NET Core
        </p>
      </div>
    </footer>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { useInvalidateNavMenus } from '@/hooks/useInvalidateNavMenus'
import logo from '@/assets/logo.png'
import { supabase } from '@/lib/supabase/client'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type LoginValues = z.infer<typeof LoginSchema>

type LoginModalProps = {
  onClose: () => void
}

export function LoginModal({ onClose }: LoginModalProps) {
  const titleId = useId()
  const [serverError, setServerError] = useState<string | null>(null)
  const invalidateNavMenus = useInvalidateNavMenus()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      setServerError(error.message)
      return
    }
    invalidateNavMenus()
    onClose()
  })

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain"
      role="presentation"
    >
      <button
        type="button"
        aria-label="ปิดหน้าต่างเข้าสู่ระบบ"
        className="fixed inset-0 cursor-default bg-slate-950/55 backdrop-blur-[2px] transition-colors hover:bg-slate-950/65"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center px-3 py-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <div className="shrink-0 rounded-2xl border border-white/20 bg-white/10 p-2.5 shadow-lg shadow-black/30 backdrop-blur-md">
              <img
                src={logo}
                alt="Krusa Club"
                className="block h-10 w-auto max-w-[min(150px,42vw)] object-contain object-left sm:h-12 sm:max-w-[170px]"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1 border-l border-white/25 pl-3 sm:pl-4">
              <h1
                id={titleId}
                className="text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl"
              >
                เข้าสู่ระบบ
              </h1>
              <p className="text-xs leading-relaxed text-white/80 sm:text-sm">(Email/Password)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl p-2 text-white ring-1 ring-white/25 transition-colors hover:bg-orange-400/25 active:bg-orange-600 touch-manipulation"
            aria-label="ปิด"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-white/20 bg-slate-950/55 p-4 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.45)] ring-1 ring-white/10 backdrop-blur-md sm:rounded-3xl sm:p-6"
        >
          <div className="space-y-1.5">
            <label className="text-sm text-white/90">Email</label>
            <input
              type="email"
              autoComplete="email"
              className="h-11 w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 text-sm text-white shadow-inner outline-none ring-1 ring-white/10 transition placeholder:text-white/40 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/50"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-red-300">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-white/90">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              className="h-11 w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 text-sm text-white shadow-inner outline-none ring-1 ring-white/10 transition placeholder:text-white/40 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/50"
              {...register('password')}
            />
            {errors.password && <p className="text-xs text-red-300">{errors.password.message}</p>}
          </div>

          {serverError && (
            <div className="rounded-2xl border border-red-400/40 bg-red-950/50 p-3 text-sm text-red-200 shadow-inner backdrop-blur-sm">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-green-400/50 bg-green-500 px-5 text-sm font-semibold text-white shadow-md shadow-green-950/40 transition-colors hover:bg-green-400 active:bg-green-600 disabled:pointer-events-none disabled:opacity-55"
            >
              {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
            <Link
              to="/register"
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-sky-400/50 bg-sky-500 px-5 text-sm font-semibold text-white shadow-md shadow-sky-950/40 transition-colors hover:bg-sky-400 active:bg-sky-600"
            >
              ลงทะเบียน
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

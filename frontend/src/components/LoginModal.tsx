import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn, UserPlus, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { useInvalidateNavMenus } from '@/hooks/useInvalidateNavMenus'
import logo from '@/assets/logo.png'
import { ed } from '@/lib/edtech-ui'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const LoginSchema = z.object({
  email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
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

  const fieldClass = cn(ed.input, 'h-12 px-4')

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain" role="presentation">
      <button
        type="button"
        aria-label="ปิดหน้าต่างเข้าสู่ระบบ"
        className="fixed inset-0 cursor-default bg-slate-900/25 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[26rem] items-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-[24px] border border-slate-200/90 bg-white',
            'shadow-[0_12px_30px_rgba(15,23,42,0.08),0_4px_16px_rgba(37,99,235,0.06)]',
          )}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-blue-50 via-sky-50/40 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-amber-200/25 blur-2xl"
            aria-hidden
          />

          <div className="relative border-b border-slate-100 px-6 pb-5 pt-6 sm:px-7 sm:pt-7">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                ed.btnGhost,
                'absolute right-4 top-4 min-h-[40px] min-w-[40px] p-2 sm:right-5 sm:top-5',
              )}
              aria-label="ปิด"
            >
              <X className="size-5" aria-hidden />
            </button>

            <div className="flex flex-col items-center gap-4 pr-10 text-center sm:pr-12">
              <div className="flex size-[4.5rem] items-center justify-center rounded-2xl border border-blue-100 bg-white p-3 shadow-sm ring-4 ring-blue-50/80">
                <img
                  src={logo}
                  alt="Krusa Club"
                  className="h-10 w-auto max-w-[140px] object-contain"
                />
              </div>
              <div className="space-y-1">
                <h1
                  id={titleId}
                  className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
                >
                  เข้าสู่ระบบ
                </h1>
                <p className="text-sm text-slate-500">ยินดีต้อนรับกลับ — ใช้อีเมลและรหัสผ่านของคุณ</p>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="relative space-y-5 px-6 py-6 sm:px-7 sm:py-7">
            <div className="space-y-2">
              <label htmlFor="login-email" className={ed.label}>
                อีเมล
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="name@school.ac.th"
                className={fieldClass}
                {...register('email')}
              />
              {errors.email ? (
                <p className="text-xs text-rose-600" role="alert">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className={ed.label}>
                รหัสผ่าน
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={fieldClass}
                {...register('password')}
              />
              {errors.password ? (
                <p className="text-xs text-rose-600" role="alert">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            {serverError ? (
              <div
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                role="alert"
              >
                {serverError}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  ed.btnPrimary,
                  'h-12 w-full gap-2.5 text-base disabled:pointer-events-none disabled:opacity-55',
                )}
              >
                <LogIn className="size-4 shrink-0" aria-hidden />
                {isSubmitting ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
              </button>
              <Link
                to="/register"
                onClick={onClose}
                className={cn(
                  ed.btnSecondary,
                  'h-12 w-full gap-2.5 text-base no-underline',
                )}
              >
                <UserPlus className="size-4 shrink-0" aria-hidden />
                ลงทะเบียน
              </Link>
            </div>

            <p className="text-center text-xs leading-relaxed text-slate-400">
              สำหรับครู นักเรียน และผู้ดูแลระบบโรงเรียน
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

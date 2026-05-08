import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import logo from '@/assets/logo.png'
import { supabase } from '@/lib/supabase/client'

const RegisterSchema = z
  .object({
    firstName: z.string().min(1, 'กรุณากรอกชื่อ').max(120, 'ชื่อยาวเกินไป'),
    lastName: z.string().min(1, 'กรุณากรอกนามสกุล').max(120, 'นามสกุลยาวเกินไป'),
    email: z.string().email('อีเมลไม่ถูกต้อง'),
    password: z.string().min(6, 'รหัสผ่านอย่างน้อย 6 ตัวอักษร'),
    confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่าน'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmPassword'],
  })

type RegisterValues = z.infer<typeof RegisterSchema>

type RegisterTab = 'profile' | 'account'

export function RegisterPage() {
  const [activeTab, setActiveTab] = useState<RegisterTab>('profile')
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const goToAccount = async () => {
    const ok = await trigger(['firstName', 'lastName'], { shouldFocus: true })
    if (ok) setActiveTab('account')
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    setSuccessMessage(null)
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          first_name: values.firstName.trim(),
          last_name: values.lastName.trim(),
        },
      },
    })
    if (error) {
      setServerError(error.message)
      return
    }
    reset()
    setActiveTab('profile')
    setSuccessMessage(
      'ลงทะเบียนสำเร็จ หากระบบต้องยืนยันอีเมล กรุณาตรวจกล่องจดหมาย แล้วเข้าสู่ระบบได้ที่ลิงก์ด้านล่าง',
    )
  })

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm font-medium text-white/85 ring-1 ring-white/20 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          หน้าแรก
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="shrink-0 rounded-2xl border border-white/20 bg-white/10 p-2.5 shadow-lg shadow-black/30 backdrop-blur-md">
          <img
            src={logo}
            alt="Krusa Club"
            className="block h-10 w-auto max-w-[min(150px,42vw)] object-contain object-left sm:h-12"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1 border-l border-white/25 pl-3 sm:pl-4">
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">ลงทะเบียน</h1>
          <p className="text-xs text-white/80 sm:text-sm">กรอกชื่อและสร้างบัญชีด้วยอีเมลกับรหัสผ่าน</p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-white/20 bg-slate-950/55 p-4 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.45)] ring-1 ring-white/10 backdrop-blur-md sm:rounded-3xl sm:p-6"
        noValidate
      >
        <div
          role="tablist"
          aria-label="ขั้นตอนลงทะเบียน"
          className="flex gap-1 rounded-2xl border border-white/15 bg-slate-900/50 p-1 ring-1 ring-white/10"
        >
          <button
            type="button"
            role="tab"
            id="register-tab-profile"
            aria-selected={activeTab === 'profile'}
            aria-controls="register-panel-profile"
            onClick={() => setActiveTab('profile')}
            className={
              activeTab === 'profile'
                ? 'flex-1 rounded-xl bg-sky-500/90 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-sky-950/30'
                : 'flex-1 rounded-xl py-2.5 text-center text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white'
            }
          >
            ข้อมูลส่วนตัว
          </button>
          <button
            type="button"
            role="tab"
            id="register-tab-account"
            aria-selected={activeTab === 'account'}
            aria-controls="register-panel-account"
            onClick={() => void goToAccount()}
            className={
              activeTab === 'account'
                ? 'flex-1 rounded-xl bg-sky-500/90 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-sky-950/30'
                : 'flex-1 rounded-xl py-2.5 text-center text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white'
            }
          >
            บัญชี
          </button>
        </div>

        <div
          id="register-panel-profile"
          role="tabpanel"
          aria-labelledby="register-tab-profile"
          hidden={activeTab !== 'profile'}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label htmlFor="register-first-name" className="text-sm text-white/90">
              ชื่อ (First name)
            </label>
            <input
              id="register-first-name"
              type="text"
              autoComplete="given-name"
              className="h-11 w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 text-sm text-white shadow-inner outline-none ring-1 ring-white/10 transition placeholder:text-white/40 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/50"
              placeholder="ชื่อ"
              {...register('firstName')}
            />
            {errors.firstName && (
              <p className="text-xs text-red-300">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-last-name" className="text-sm text-white/90">
              นามสกุล (Last name)
            </label>
            <input
              id="register-last-name"
              type="text"
              autoComplete="family-name"
              className="h-11 w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 text-sm text-white shadow-inner outline-none ring-1 ring-white/10 transition placeholder:text-white/40 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/50"
              placeholder="นามสกุล"
              {...register('lastName')}
            />
            {errors.lastName && (
              <p className="text-xs text-red-300">{errors.lastName.message}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => void goToAccount()}
            className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white shadow-inner transition-colors hover:bg-white/15 active:bg-white/20 sm:w-auto"
          >
            ถัดไป — ตั้งค่าบัญชี
          </button>
        </div>

        <div
          id="register-panel-account"
          role="tabpanel"
          aria-labelledby="register-tab-account"
          hidden={activeTab !== 'account'}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label htmlFor="register-email" className="text-sm text-white/90">
              Email/เบอร์โทรศัพท์
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              className="h-11 w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 text-sm text-white shadow-inner outline-none ring-1 ring-white/10 transition placeholder:text-white/40 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/50"
              placeholder="you@school.ac.th"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-red-300">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-password" className="text-sm text-white/90">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              className="h-11 w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 text-sm text-white shadow-inner outline-none ring-1 ring-white/10 transition placeholder:text-white/40 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/50"
              {...register('password')}
            />
            {errors.password && <p className="text-xs text-red-300">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-confirm" className="text-sm text-white/90">
              ยืนยันรหัสผ่าน
            </label>
            <input
              id="register-confirm"
              type="password"
              autoComplete="new-password"
              className="h-11 w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 text-sm text-white shadow-inner outline-none ring-1 ring-white/10 transition placeholder:text-white/40 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/50"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-300">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {serverError && (
          <div className="rounded-2xl border border-red-400/40 bg-red-950/50 p-3 text-sm text-red-200 shadow-inner backdrop-blur-sm">
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-400/35 bg-emerald-950/40 p-3 text-sm text-emerald-100 shadow-inner backdrop-blur-sm">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {activeTab === 'account' ? (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="inline-flex h-12 min-w-[8rem] items-center justify-center rounded-full border border-white/25 bg-transparent px-5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
              >
                กลับ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 min-w-[10rem] flex-1 items-center justify-center rounded-full border border-sky-400/50 bg-sky-500 px-5 text-sm font-semibold text-white shadow-md shadow-sky-950/40 transition-colors hover:bg-sky-400 active:bg-sky-600 disabled:pointer-events-none disabled:opacity-55 sm:flex-initial"
              >
                {isSubmitting ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
              </button>
            </div>
          ) : (
            <p className="text-center text-sm text-white/60 sm:text-left">
              เริ่มจากแท็บ <span className="text-white/85">ข้อมูลส่วนตัว</span> แล้วไปตั้งรหัสที่แท็บ{' '}
              <span className="text-white/85">บัญชี</span>
            </p>
          )}
          <p
            className={`text-center text-sm text-white/75 sm:text-left ${activeTab === 'account' ? 'sm:ml-auto' : ''}`}
          >
            มีบัญชีแล้ว?{' '}
            <Link
              to="/login"
              className="font-semibold text-orange-400 underline-offset-2 hover:text-orange-300 hover:underline"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

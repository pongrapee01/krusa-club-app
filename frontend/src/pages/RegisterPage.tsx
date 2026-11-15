import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import logo from '@/assets/logo.png'
import { ed } from '@/lib/edtech-ui'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

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

  const fieldClass = cn(ed.input, 'h-12 px-4')

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/" className={cn(ed.btnGhost, 'min-h-[44px] gap-2 no-underline')}>
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          หน้าแรก
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="shrink-0 rounded-3xl border border-blue-100 bg-white p-2.5 shadow-ed-raised ring-4 ring-blue-50/80">
          <img
            src={logo}
            alt="Krusa Club"
            className="block h-10 w-auto max-w-[min(150px,42vw)] object-contain object-left sm:h-12"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1 border-l border-slate-200 pl-3 sm:pl-4">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">ลงทะเบียน</h1>
          <p className="text-xs text-slate-500 sm:text-sm">กรอกชื่อและสร้างบัญชีด้วยอีเมลกับรหัสผ่าน</p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className={cn(
          ed.surface,
          'space-y-4 p-4 sm:p-6',
        )}
        noValidate
      >
        <div
          role="tablist"
          aria-label="ขั้นตอนลงทะเบียน"
          className="flex gap-1 rounded-full border border-slate-200 bg-slate-50/90 p-1 shadow-ed-inset"
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
                ? 'flex-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 py-2.5 text-center text-sm font-semibold text-white shadow-ed-btn-primary'
                : 'flex-1 rounded-full py-2.5 text-center text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900'
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
                ? 'flex-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 py-2.5 text-center text-sm font-semibold text-white shadow-ed-btn-primary'
                : 'flex-1 rounded-full py-2.5 text-center text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900'
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
          <div className="space-y-2">
            <label htmlFor="register-first-name" className={ed.label}>
              ชื่อ (First name)
            </label>
            <input
              id="register-first-name"
              type="text"
              autoComplete="given-name"
              className={fieldClass}
              placeholder="ชื่อ"
              {...register('firstName')}
            />
            {errors.firstName && (
              <p className="text-xs text-rose-600" role="alert">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="register-last-name" className={ed.label}>
              นามสกุล (Last name)
            </label>
            <input
              id="register-last-name"
              type="text"
              autoComplete="family-name"
              className={fieldClass}
              placeholder="นามสกุล"
              {...register('lastName')}
            />
            {errors.lastName && (
              <p className="text-xs text-rose-600" role="alert">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => void goToAccount()}
            className={cn(ed.btnSecondary, 'h-12 w-full sm:w-auto')}
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
          <div className="space-y-2">
            <label htmlFor="register-email" className={ed.label}>
              Email/เบอร์โทรศัพท์
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              className={fieldClass}
              placeholder="you@school.ac.th"
              {...register('email')}
            />
            {errors.email ? (
              <p className="text-xs text-rose-600" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="register-password" className={ed.label}>
              Password
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-xs text-rose-600" role="alert">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="register-confirm" className={ed.label}>
              ยืนยันรหัสผ่าน
            </label>
            <input
              id="register-confirm"
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-rose-600" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {serverError && (
          <div
            className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            role="alert"
          >
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {activeTab === 'account' ? (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={cn(ed.btnSecondary, 'h-12 min-w-[8rem]')}
              >
                กลับ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  ed.btnPrimary,
                  'h-12 min-w-[10rem] flex-1 disabled:pointer-events-none disabled:opacity-55 sm:flex-initial',
                )}
              >
                {isSubmitting ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
              </button>
            </div>
          ) : (
            <p className={cn('text-center text-sm sm:text-left', ed.textMuted)}>
              เริ่มจากแท็บ <span className={ed.textSub}>ข้อมูลส่วนตัว</span> แล้วไปตั้งรหัสที่แท็บ{' '}
              <span className={ed.textSub}>บัญชี</span>
            </p>
          )}
          <p
            className={cn(
              'text-center text-sm sm:text-left',
              ed.textSub,
              activeTab === 'account' ? 'sm:ml-auto' : '',
            )}
          >
            มีบัญชีแล้ว?{' '}
            <Link to="/login" className={cn('font-semibold', ed.textLink)}>
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

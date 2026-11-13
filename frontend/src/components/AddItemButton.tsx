import { Plus, type LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

import { ed } from '@/lib/edtech-ui'
import { cn } from '@/lib/utils'

type AddItemButtonProps = {
  /** ใช้กับ aria-label และ tooltip (title) เท่านั้น — ไม่แสดงบนหน้าจอ */
  label: string
  icon?: LucideIcon
  className?: string
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'disabled' | 'type'>

export function AddItemButton({
  label,
  icon: Icon = Plus,
  className,
  onClick,
  disabled,
  type = 'button',
}: AddItemButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(ed.btnIconSuccess, className)}
    >
      <Icon className="size-5" strokeWidth={2.25} aria-hidden />
    </button>
  )
}

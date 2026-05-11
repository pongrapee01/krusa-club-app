import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  BookText,
  Calendar,
  CalendarDays,
  ChartColumnIncreasing,
  CircleHelp,
  FileText,
  Gamepad2,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogIn,
  Menu,
  Settings,
  Shield,
  Users,
} from 'lucide-react'

/**
 * แมปค่า `icon` จาก API → Lucide component (whitelist เพื่อ tree-shake)
 * รองรับทั้ง kebab-case, snake_case และ PascalCase ของชื่อ Lucide
 */
const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  house: Home,
  dashboard: LayoutDashboard,
  'layout-dashboard': LayoutDashboard,
  /** บาง serializer ต่อคำเป็น lowercase ติดกัน */
  layoutdashboard: LayoutDashboard,
  /** icon จริงจาก API สำหรับเมนู Dashboard */
  'chart-column-increasing': ChartColumnIncreasing,
  chartcolumnincreasing: ChartColumnIncreasing,

  guide: BookOpen,
  book: BookOpen,
  'book-open': BookOpen,
  'book-text': BookText,
  booktext: BookText,

  calendar: Calendar,
  schedule: Calendar,
  'calendar-days': CalendarDays,
  calendardays: CalendarDays,

  settings: Settings,
  configuration: Settings,
  config: Settings,
  gear: Settings,

  users: Users,
  'user-management': Users,
  usermanagement: Users,
  user: Users,

  permission: Shield,
  permissions: Shield,
  shield: Shield,

  login: LogIn,
  'log-in': LogIn,

  classroom: GraduationCap,
  playground: Gamepad2,
  'gamepad-2': Gamepad2,
  gamepad2: Gamepad2,

  'file-text': FileText,
  filetext: FileText,

  'circle-help': CircleHelp,
  'help-circle': CircleHelp,
  qa: CircleHelp,

  menu: Menu,
}

function normalizeKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/_/g, '-')
}

/** แปลง PascalCase / camelCase → kebab-case สำหรับจับคู่กับ ICON_MAP */
function pascalOrCamelToKebab(input: string): string {
  const s = input.trim()
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Za-z])([A-Z])(?=[a-z])/g, '$1-$2')
    .toLowerCase()
}

/** ตัด suffix `Icon` ที่บางทีตามมาจากชื่อ Lucide / code gen */
function stripTrailingIconSuffix(raw: string): string {
  return raw.trim().replace(/\s*Icon\s*$/i, '').trim()
}

function collectLookupKeys(raw: string): string[] {
  const t = raw.trim()
  if (!t) return []
  const stripped = stripTrailingIconSuffix(t)
  const variants = stripped === t ? [t] : [t, stripped]

  const keys = new Set<string>()
  for (const v of variants) {
    keys.add(normalizeKey(v))
    keys.add(v.toLowerCase())
    if (/[A-Z]/.test(v)) keys.add(pascalOrCamelToKebab(v))
    const compact = v.toLowerCase().replace(/[\s_-]/g, '')
    if (compact) keys.add(compact)
  }
  return [...keys]
}

export function resolveNavMenuLucideIcon(icon: string | null | undefined): LucideIcon | null {
  if (!icon?.trim()) return null
  for (const k of collectLookupKeys(icon)) {
    const found = ICON_MAP[k]
    if (found) return found
  }
  return null
}

type NavMenuIconProps = {
  icon?: string | null
  className?: string
}

export function NavMenuIcon({ icon, className }: NavMenuIconProps) {
  const Icon = resolveNavMenuLucideIcon(icon)
  if (!Icon) return null
  return <Icon className={className} aria-hidden />
}

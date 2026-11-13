import type {
  ClassRow,
  MenuRow,
  MenuType,
  PeriodRow,
  RoleRow,
  SemesterRow,
  StatusCode,
  SystemStatusRow,
  TitleRow,
} from '@/features/config-master/types'
import type {
  MasterClassApiDto,
  MasterMenuApiDto,
  MasterPeriodApiDto,
  MasterRoleApiDto,
  MasterSemesterApiDto,
  MasterSystemStatusApiDto,
  MasterTitleApiDto,
} from '@/services/masterApiTypes'

/** สอดคล้อง system_status ใน DB (ปรับได้เมื่อ API ระบุ enum ชัดเจน) */
const STATUS_ID_TO_CODE: Record<number, StatusCode> = {
  1: 'active',
  2: 'inactive',
  3: 'deleted',
}

const CODE_TO_STATUS_ID: Record<StatusCode, number> = {
  active: 1,
  inactive: 2,
  deleted: 3,
}

export function statusIdToCode(statusId: number): StatusCode {
  return STATUS_ID_TO_CODE[statusId] ?? 'inactive'
}

export function statusCodeToId(statusCode: StatusCode): number {
  return CODE_TO_STATUS_ID[statusCode] ?? 2
}

export function mapRoleFromApi(dto: MasterRoleApiDto): RoleRow {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    description: dto.description ?? '',
    statusCode: statusIdToCode(dto.statusId),
  }
}

export function mapRoleToApi(row: RoleRow): MasterRoleApiDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description || null,
    statusId: statusCodeToId(row.statusCode),
  }
}

export function mapTitleFromApi(dto: MasterTitleApiDto, sortOrder: number): TitleRow {
  const desc = dto.description?.trim() ?? ''
  return {
    id: dto.id,
    code: desc || dto.name.trim().slice(0, 32),
    label: dto.name,
    sortOrder,
    statusCode: statusIdToCode(dto.statusId),
  }
}

export function mapTitleToApi(row: TitleRow): MasterTitleApiDto {
  return {
    id: row.id,
    name: row.label,
    description: row.code.trim() || null,
    statusId: statusCodeToId(row.statusCode),
  }
}

function trimTime(value: string): string {
  const v = value.trim()
  if (v.length >= 5 && v.includes(':')) return v.slice(0, 5)
  return v
}

function parseClassRoom(name: string, level: string): string {
  const slash = name.indexOf('/')
  if (slash >= 0 && slash < name.length - 1) {
    return name.slice(slash + 1).trim()
  }
  const levelPrefix = `${level}/`
  if (name.startsWith(levelPrefix)) return name.slice(levelPrefix.length).trim()
  return name.replace(level, '').replace(/^\//, '').trim() || '1'
}

function systemStatusNameToCode(name: string): StatusCode {
  const n = name.trim().toLowerCase()
  if (n === 'active' || n === 'inactive' || n === 'deleted') return n
  if (n.includes('delete')) return 'deleted'
  if (n.includes('inact')) return 'inactive'
  return 'active'
}

function systemStatusCodeToName(code: StatusCode): string {
  return code.toUpperCase()
}

function periodTypeLabel(periodType: string, periodNumber: number): string {
  const t = periodType.trim().toUpperCase()
  if (t === 'BREAK') return 'พัก'
  if (t === 'LUNCH') return 'พักเที่ยง'
  if (t === 'ASSEMBLY') return 'ชุมนุม'
  if (periodNumber <= 0) return t || '—'
  return `คาบ ${periodNumber}`
}

export function mapSemesterFromApi(dto: MasterSemesterApiDto): SemesterRow {
  const year = Number.parseInt(dto.academicYear, 10)
  const termNum = dto.term === '2' ? 2 : 1
  const yearStr = dto.academicYear.trim()
  return {
    id: dto.id,
    code: `${yearStr}-T${termNum}`,
    label: `ภาคเรียนที่ ${termNum} ปี ${yearStr}`,
    academicYear: Number.isFinite(year) ? year : Number(yearStr) || 2568,
    term: termNum,
    startDate: dto.startDate?.slice(0, 10) ?? '',
    endDate: dto.endDate?.slice(0, 10) ?? '',
    isCurrent: Boolean(dto.isCurrent),
    statusCode: statusIdToCode(dto.statusId),
  }
}

export function mapSemesterToApi(row: SemesterRow): MasterSemesterApiDto {
  return {
    id: row.id,
    academicYear: String(row.academicYear),
    term: String(row.term),
    startDate: row.startDate,
    endDate: row.endDate,
    isCurrent: row.isCurrent,
    statusId: statusCodeToId(row.statusCode),
  }
}

export function mapClassFromApi(dto: MasterClassApiDto, sortOrder: number): ClassRow {
  const level = dto.level.trim()
  const name = dto.name.trim()
  return {
    id: dto.id,
    gradeLevel: level,
    room: parseClassRoom(name, level),
    label: name,
    sortOrder,
    statusCode: statusIdToCode(dto.statusId),
  }
}

export function mapClassToApi(row: ClassRow): MasterClassApiDto {
  const label = row.label.trim() || `${row.gradeLevel}/${row.room}`.trim()
  return {
    id: row.id,
    name: label,
    level: row.gradeLevel.trim(),
    statusId: statusCodeToId(row.statusCode),
  }
}

export function mapPeriodFromApi(dto: MasterPeriodApiDto, sortOrder: number): PeriodRow {
  return {
    id: String(dto.id),
    periodNo: dto.periodNumber,
    label: periodTypeLabel(dto.periodType, dto.periodNumber),
    startTime: trimTime(dto.startTime),
    endTime: trimTime(dto.endTime),
    sortOrder,
    statusCode: statusIdToCode(dto.statusId),
  }
}

export function mapPeriodToApi(row: PeriodRow): MasterPeriodApiDto {
  const idNum = Number(row.id)
  return {
    id: Number.isFinite(idNum) && String(idNum) === row.id ? idNum : row.id,
    periodNumber: row.periodNo,
    startTime: row.startTime.length === 5 ? `${row.startTime}:00` : row.startTime,
    endTime: row.endTime.length === 5 ? `${row.endTime}:00` : row.endTime,
    periodType: inferPeriodTypeFromLabel(row.label, row.periodNo),
    statusId: statusCodeToId(row.statusCode),
  }
}

function inferPeriodTypeFromLabel(label: string, periodNo: number): string {
  if (label.includes('พักเที่ยง')) return 'LUNCH'
  if (label.includes('พัก')) return 'BREAK'
  if (label.includes('ชุมนุม')) return 'ASSEMBLY'
  return periodNo <= 0 ? 'BREAK' : 'LESSON'
}

export function mapSystemStatusFromApi(
  dto: MasterSystemStatusApiDto,
  sortOrder: number,
): SystemStatusRow {
  const code = systemStatusNameToCode(dto.name)
  return {
    id: String(dto.id),
    code,
    name: dto.description?.trim() || dto.name.trim(),
    status: code,
    sortOrder,
  }
}

export function mapSystemStatusToApi(row: SystemStatusRow): MasterSystemStatusApiDto {
  const idNum = Number(row.id)
  return {
    id: Number.isFinite(idNum) && String(idNum) === row.id ? idNum : row.id,
    name: systemStatusCodeToName(row.code as StatusCode),
    description: row.name.trim() || null,
  }
}

function inferMenuTypeFromApi(dto: MasterMenuApiDto, all: MasterMenuApiDto[]): MenuType {
  const apiType = dto.type.trim().toUpperCase()
  if (apiType === 'DIVIDER') return 'divider'
  const code = dto.code.trim()
  const hasChildren = all.some((row) => row.parentCode?.trim() === code)
  if (hasChildren) return 'group'
  return 'link'
}

function menuTypeToApiType(menuType: MenuType): string {
  if (menuType === 'divider') return 'DIVIDER'
  return 'SIDEBAR'
}

export function mapMenusFromApi(dtos: MasterMenuApiDto[]): MenuRow[] {
  return dtos.map((dto, index) => {
    const parentCode = dto.parentCode?.trim() || null
    return {
      id: dto.id,
      code: dto.code.trim(),
      label: dto.label.trim(),
      path: dto.path?.trim() ?? '',
      parentCode,
      icon: '',
      sortOrder: index + 1,
      matchEnd: true,
      menuType: inferMenuTypeFromApi(dto, dtos),
      statusCode: statusIdToCode(dto.statusId),
    }
  })
}

export function mapMenuToApi(row: MenuRow): MasterMenuApiDto {
  return {
    id: row.id,
    code: row.code.trim(),
    label: row.label.trim(),
    parentCode: row.parentCode?.trim() || null,
    path: row.path.trim(),
    type: menuTypeToApiType(row.menuType),
    description: null,
    statusId: statusCodeToId(row.statusCode),
  }
}

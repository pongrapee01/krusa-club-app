import type { MasterFieldDef, MasterKey, MasterSectionConfig, StatusCode } from '@/features/config-master/types'

export const STATUS_OPTIONS = [
  { value: 'active', label: 'ใช้งาน (active)' },
  { value: 'inactive', label: 'ปิดใช้งาน (inactive)' },
  { value: 'deleted', label: 'ลบ soft (deleted)' },
] as const

const statusField: MasterFieldDef = {
  name: 'statusCode',
  label: 'สถานะระบบ',
  type: 'select',
  required: true,
  options: [...STATUS_OPTIONS],
}

const systemStatusField: MasterFieldDef = {
  name: 'status',
  label: 'สถานะ',
  type: 'select',
  required: true,
  options: [...STATUS_OPTIONS],
}

export const MASTER_SECTIONS: MasterSectionConfig[] = [
  {
    key: 'system_status',
    label: 'สถานะระบบ',
    description: 'ค่าอ้างอิง active / inactive / deleted สำหรับตารางอื่น',
    columns: [
      { key: 'code', header: 'รหัส' },
      { key: 'name', header: 'ชื่อแสดง' },
      { key: 'status', header: 'สถานะ' },
      { key: 'sortOrder', header: 'ลำดับ', className: 'tabular-nums' },
    ],
    fields: [
      { name: 'code', label: 'รหัส (code)', type: 'text', required: true },
      { name: 'name', label: 'ชื่อแสดง', type: 'text', required: true },
      systemStatusField,
      { name: 'sortOrder', label: 'ลำดับ', type: 'number', required: true, min: 0 },
    ],
  },
  {
    key: 'titles',
    label: 'คำนำหน้าชื่อ',
    description: 'ใช้ในฟอร์มนักเรียน/ครู',
    columns: [
      { key: 'code', header: 'รหัส' },
      { key: 'label', header: 'คำนำหน้า' },
      { key: 'statusCode', header: 'สถานะ' },
      { key: 'sortOrder', header: 'ลำดับ', className: 'tabular-nums' },
    ],
    fields: [
      { name: 'code', label: 'รหัส', type: 'text', required: true },
      { name: 'label', label: 'คำนำหน้า', type: 'text', required: true },
      statusField,
      { name: 'sortOrder', label: 'ลำดับ', type: 'number', required: true, min: 0 },
    ],
  },
  {
    key: 'attendance_status',
    label: 'สถานะเช็คชื่อ',
    description: 'ค่าสถานะบนการ์ดเช็คชื่อ (present, absent, …)',
    columns: [
      { key: 'code', header: 'รหัส' },
      { key: 'label', header: 'ชื่อ' },
      { key: 'description', header: 'คำอธิบาย' },
      { key: 'statusCode', header: 'สถานะ' },
      { key: 'sortOrder', header: 'ลำดับ', className: 'tabular-nums' },
    ],
    fields: [
      { name: 'code', label: 'รหัส', type: 'text', required: true },
      { name: 'label', label: 'ชื่อแสดง', type: 'text', required: true },
      { name: 'description', label: 'คำอธิบาย', type: 'textarea' },
      statusField,
      { name: 'sortOrder', label: 'ลำดับ', type: 'number', required: true, min: 0 },
    ],
  },
  {
    key: 'roles',
    label: 'บทบาท (Roles)',
    description: 'Role สำหรับสิทธิ์และเมนู',
    columns: [
      { key: 'code', header: 'รหัส' },
      { key: 'name', header: 'ชื่อ' },
      { key: 'description', header: 'คำอธิบาย' },
      { key: 'statusCode', header: 'สถานะ' },
    ],
    fields: [
      { name: 'code', label: 'รหัส (slug)', type: 'text', required: true },
      { name: 'name', label: 'ชื่อบทบาท', type: 'text', required: true },
      { name: 'description', label: 'คำอธิบาย', type: 'textarea' },
      statusField,
    ],
  },
  {
    key: 'semesters',
    label: 'ภาคเรียน',
    description: 'ช่วงเวลาเรียนของโรงเรียน',
    columns: [
      { key: 'code', header: 'รหัส' },
      { key: 'label', header: 'ชื่อ' },
      { key: 'academicYear', header: 'ปีการศึกษา', className: 'tabular-nums' },
      { key: 'term', header: 'เทอม', className: 'tabular-nums' },
      { key: 'isCurrent', header: 'ปัจจุบัน' },
      { key: 'statusCode', header: 'สถานะ' },
    ],
    fields: [
      { name: 'code', label: 'รหัส', type: 'text', required: true },
      { name: 'label', label: 'ชื่อภาคเรียน', type: 'text', required: true },
      { name: 'academicYear', label: 'ปีการศึกษา (พ.ศ.)', type: 'number', required: true, min: 2500, max: 2600 },
      {
        name: 'term',
        label: 'ภาคเรียนที่',
        type: 'select',
        required: true,
        options: [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
        ],
      },
      { name: 'startDate', label: 'วันเริ่ม', type: 'date', required: true },
      { name: 'endDate', label: 'วันสิ้นสุด', type: 'date', required: true },
      { name: 'isCurrent', label: 'ภาคเรียนปัจจุบัน', type: 'checkbox' },
      statusField,
    ],
  },
  {
    key: 'subjects',
    label: 'รายวิชา',
    description: 'วิชาที่ใช้ในตารางสอน',
    columns: [
      { key: 'code', header: 'รหัส' },
      { key: 'name', header: 'ชื่อวิชา' },
      { key: 'statusCode', header: 'สถานะ' },
      { key: 'sortOrder', header: 'ลำดับ', className: 'tabular-nums' },
    ],
    fields: [
      { name: 'code', label: 'รหัสวิชา', type: 'text', required: true },
      { name: 'name', label: 'ชื่อวิชา', type: 'text', required: true },
      statusField,
      { name: 'sortOrder', label: 'ลำดับ', type: 'number', required: true, min: 0 },
    ],
  },
  {
    key: 'periods',
    label: 'คาบเรียน',
    description: 'ช่วงเวลาคาบ (ใช้ smart detect เช็คชื่อ)',
    columns: [
      { key: 'periodNo', header: 'คาบที่', className: 'tabular-nums' },
      { key: 'label', header: 'ชื่อ' },
      { key: 'startTime', header: 'เริ่ม' },
      { key: 'endTime', header: 'สิ้นสุด' },
      { key: 'statusCode', header: 'สถานะ' },
    ],
    fields: [
      { name: 'periodNo', label: 'คาบที่', type: 'number', required: true, min: 1, max: 12 },
      { name: 'label', label: 'ชื่อคาบ', type: 'text', required: true },
      { name: 'startTime', label: 'เวลาเริ่ม', type: 'time', required: true },
      { name: 'endTime', label: 'เวลาสิ้นสุด', type: 'time', required: true },
      statusField,
      { name: 'sortOrder', label: 'ลำดับ', type: 'number', required: true, min: 0 },
    ],
  },
  {
    key: 'classes',
    label: 'ห้องเรียน',
    description: 'ห้องเรียน เช่น ป.4/1',
    columns: [
      { key: 'label', header: 'ชื่อห้อง' },
      { key: 'gradeLevel', header: 'ระดับชั้น' },
      { key: 'room', header: 'ห้อง' },
      { key: 'statusCode', header: 'สถานะ' },
      { key: 'sortOrder', header: 'ลำดับ', className: 'tabular-nums' },
    ],
    fields: [
      { name: 'gradeLevel', label: 'ระดับชั้น', type: 'text', required: true, placeholder: 'เช่น ป.4' },
      { name: 'room', label: 'ห้อง', type: 'text', required: true, placeholder: 'เช่น 1' },
      { name: 'label', label: 'ชื่อแสดง (อัตโนมัติได้)', type: 'text', required: true, placeholder: 'ป.4/1' },
      statusField,
      { name: 'sortOrder', label: 'ลำดับ', type: 'number', required: true, min: 0 },
    ],
  },
  {
    key: 'menus',
    label: 'เมนูระบบ',
    description: 'โครงสร้างเมนูนำทาง (อ้างอิง parent ด้วย code)',
    columns: [
      { key: 'code', header: 'รหัส' },
      { key: 'label', header: 'ชื่อ' },
      { key: 'path', header: 'Path' },
      { key: 'parentCode', header: 'Parent' },
      { key: 'menuType', header: 'ประเภท' },
      { key: 'statusCode', header: 'สถานะ' },
    ],
    fields: [
      { name: 'code', label: 'รหัสเมนู', type: 'text', required: true },
      { name: 'label', label: 'ชื่อแสดง', type: 'text', required: true },
      { name: 'path', label: 'Path', type: 'text', required: true, placeholder: '/config/master' },
      {
        name: 'parentCode',
        label: 'เมนูแม่ (code)',
        type: 'select',
        options: [{ value: '', label: '— ไม่มี (top-level) —' }],
      },
      { name: 'icon', label: 'Icon (slug)', type: 'text', placeholder: 'settings' },
      {
        name: 'menuType',
        label: 'ประเภท',
        type: 'select',
        required: true,
        options: [
          { value: 'link', label: 'ลิงก์' },
          { value: 'group', label: 'กลุ่ม' },
          { value: 'divider', label: 'ตัวคั่น' },
        ],
      },
      { name: 'sortOrder', label: 'ลำดับ', type: 'number', required: true, min: 0 },
      { name: 'matchEnd', label: 'matchEnd (route ตรงเป๊ะ)', type: 'checkbox' },
      statusField,
    ],
  },
]

export const MASTER_SECTION_ORDER: MasterKey[] = MASTER_SECTIONS.map((s) => s.key)

export function getSection(key: MasterKey): MasterSectionConfig {
  const found = MASTER_SECTIONS.find((s) => s.key === key)
  if (!found) throw new Error(`Unknown master section: ${key}`)
  return found
}

export function statusLabel(code: StatusCode | string): string {
  const hit = STATUS_OPTIONS.find((o) => o.value === code)
  return hit?.label ?? String(code)
}

export function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'ใช่' : 'ไม่'
  if (typeof value === 'string' && (value === 'active' || value === 'inactive' || value === 'deleted')) {
    return statusLabel(value as StatusCode)
  }
  return String(value)
}

export function newRowId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

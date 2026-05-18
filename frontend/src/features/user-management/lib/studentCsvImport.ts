import type { Gender, GradeLevel, StudentRow } from '@/features/user-management/types'

const GRADES = new Set<GradeLevel>(['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'])

const REQUIRED_HEADERS = [
  'studentId',
  'title',
  'firstName',
  'lastName',
  'gender',
  'birthDate',
  'gradeLevel',
  'room',
  'rollNo',
  'guardianPhone',
  'notes',
] as const

function normHeader(s: string) {
  return s.replace(/^\ufeff/, '').trim().toLowerCase()
}

function parseDelimitedLine(line: string, delimiter: ',' | '\t'): string[] {
  const out: string[] = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!
    if (c === '"') {
      inQ = !inQ
      continue
    }
    if (!inQ && c === delimiter) {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += c
  }
  out.push(cur.trim())
  return out
}

function detectDelimiter(line: string): ',' | '\t' {
  const tabs = (line.match(/\t/g) ?? []).length
  const commas = (line.match(/,/g) ?? []).length
  return tabs > commas ? '\t' : ','
}

function parseGender(raw: string): Gender | null {
  const s = raw.trim().toLowerCase()
  if (['male', 'm', 'ชาย'].includes(s)) return 'male'
  if (['female', 'f', 'หญิง'].includes(s)) return 'female'
  if (['unspecified', 'ไม่ระบุ', ''].includes(s)) return 'unspecified'
  return null
}

function parseGrade(raw: string): GradeLevel | null {
  const t = raw.trim() as GradeLevel
  return GRADES.has(t) ? t : null
}

function parseRoll(raw: string): number | null {
  const n = Number(String(raw).trim())
  if (!Number.isFinite(n) || n < 1 || n > 99) return null
  return n
}

function parseBirthDate(raw: string): string | null {
  const s = raw.trim()
  if (!s) return '2000-01-01'
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  return null
}

function makeId(seq: number) {
  return `s-import-${Date.now()}-${seq}-${Math.random().toString(36).slice(2, 6)}`
}

export function buildStudentCsvTemplate(): string {
  const header = `${REQUIRED_HEADERS.join(',')}\n`
  const sample =
    'STU-2568-999,เด็กชาย,ตัวอย่าง,นำเข้า,male,2015-03-01,ป.4,1,1,081-000-0000,แถวตัวอย่าง\n'
  return header + sample
}

export type StudentCsvParseIssue = { line: number; message: string }

export function parseStudentImportCsv(text: string): {
  rows: StudentRow[]
  errors: StudentCsvParseIssue[]
} {
  const errors: StudentCsvParseIssue[] = []
  const rawLines = text.split(/\r?\n/).filter((l) => l.replace(/^\ufeff/, '').trim().length > 0)
  if (rawLines.length < 2) {
    errors.push({ line: 1, message: 'ต้องมีหัวตารางอย่างน้อย 1 แถว และแถวข้อมูลอย่างน้อย 1 แถว' })
    return { rows: [], errors }
  }

  const delim = detectDelimiter(rawLines[0]!)
  const headers = parseDelimitedLine(rawLines[0]!, delim).map(normHeader)
  const idx: Record<(typeof REQUIRED_HEADERS)[number], number> = {} as Record<
    (typeof REQUIRED_HEADERS)[number],
    number
  >

  for (const key of REQUIRED_HEADERS) {
    const i = headers.indexOf(key.toLowerCase())
    if (i < 0) {
      errors.push({
        line: 1,
        message: `หัวคอลัมน์ไม่ครบ: ต้องมีคอลัมน์ "${key}" (ลำดับได้ตามแม่แบบ)`,
      })
      return { rows: [], errors }
    }
    idx[key] = i
  }

  const rows: StudentRow[] = []
  let seq = 0

  for (let li = 1; li < rawLines.length; li++) {
    const lineNum = li + 1
    const cells = parseDelimitedLine(rawLines[li]!, delim)
    if (cells.length < REQUIRED_HEADERS.length) {
      errors.push({ line: lineNum, message: `คอลัมน์ไม่ครบ (พบ ${cells.length})` })
      continue
    }

    const get = (k: (typeof REQUIRED_HEADERS)[number]) => (cells[idx[k]] ?? '').trim()

    const studentId = get('studentId') || `STU-2568-${900 + seq}`
    const title = get('title')
    const firstName = get('firstName')
    const lastName = get('lastName')
    const gender = parseGender(get('gender'))
    const birthDate = parseBirthDate(get('birthDate'))
    const gradeLevel = parseGrade(get('gradeLevel'))
    const room = get('room')
    const rollNo = parseRoll(get('rollNo'))
    const guardianPhone = get('guardianPhone')
    const notes = get('notes')

    if (!title || !firstName || !lastName) {
      errors.push({ line: lineNum, message: 'title / firstName / lastName ต้องไม่ว่าง' })
      continue
    }
    if (!gender) {
      errors.push({ line: lineNum, message: 'gender ไม่ถูกต้อง (ใช้ male, female, unspecified หรือ ชาย/หญิง)' })
      continue
    }
    if (!birthDate) {
      errors.push({ line: lineNum, message: 'birthDate ใช้รูปแบบ YYYY-MM-DD หรือเว้นว่าง' })
      continue
    }
    if (!gradeLevel) {
      errors.push({ line: lineNum, message: 'gradeLevel ต้องเป็น ป.1–ป.6' })
      continue
    }
    if (!room) {
      errors.push({ line: lineNum, message: 'room ต้องไม่ว่าง' })
      continue
    }
    if (rollNo === null) {
      errors.push({ line: lineNum, message: 'rollNo ต้องเป็นตัวเลข 1–99' })
      continue
    }
    if (!guardianPhone) {
      errors.push({ line: lineNum, message: 'guardianPhone ต้องไม่ว่าง' })
      continue
    }

    const fullName = `${title}${firstName} ${lastName}`.trim()
    const now = new Date().toISOString()
    rows.push({
      id: makeId(seq++),
      studentId,
      title,
      firstName,
      lastName,
      fullName,
      gradeLevel,
      room,
      rollNo,
      gender,
      status: 'active',
      guardianPhone,
      notes,
      birthDate,
      createdAt: now,
    })
  }

  return { rows, errors }
}

# Frontend API Contract (Navigation)

เอกสารนี้สรุปรูปแบบ `request` และ `response` สำหรับ Frontend ที่เรียก API ฝั่ง `.NET` โดยใช้ Supabase JWT (Bearer token) อัตโนมัติผ่าน `apiClient`

## 1) Authentication สำหรับทุก endpoint

- Frontend จะส่ง header:
  - `Authorization: Bearer <supabase_access_token>`
  - `Content-Type: application/json` (เมื่อมี body)
- Backend ต้อง validate JWT จาก Supabase ก่อนตอบข้อมูล

## 2) Navigation API (เมนูตาม role)

### Endpoint

- `GET /menus/me`

### Request

```http
GET /menus/me HTTP/1.1
Host: <api-host>
Authorization: Bearer <supabase_access_token>
Accept: application/json
```

### Response

Array ของ `MenuItemDto` (recursive) — ตรงกับ .NET model:

```json
[
  {
    "id": 1,
    "code": "dashboard",
    "label": "Dashboard",
    "path": "/dashboard",
    "icon": "chart-column-increasing",
    "subMenus": []
  },
  {
    "id": 2,
    "code": "configuration",
    "label": "Configuration",
    "path": "/config",
    "icon": "settings",
    "subMenus": [
      {
        "id": 3,
        "code": "user-management",
        "label": "User Management",
        "path": "/config/users",
        "icon": "users",
        "subMenus": []
      },
      {
        "id": 4,
        "code": "permission",
        "label": "Permission",
        "path": "/config/permission",
        "icon": "shield",
        "subMenus": []
      }
    ]
  }
]
```

### TypeScript Type (menuService.ts)

```ts
export type MenuItemDto = {
  id: number          // int จาก .NET
  code: string        // unique code
  label: string       // ข้อความที่แสดงใน UI
  path: string        // route path (maps to NavItem.to)
  icon?: string | null
  subMenus: MenuItemDto[]   // recursive children (maps to NavItem.children)
}
```

### Mapping → NavItem

| MenuItemDto field | NavItem field | หมายเหตุ |
|---|---|---|
| `id` (number) | `id` (string) | `String(dto.id)` |
| `label` | `label` | ตรงกัน |
| `path` | `to` | rename |
| `icon` | `icon` | ส่งเป็น string slug (เช่น `layout-dashboard`, `Users`, `settings`) — แมปเป็น Lucide ใน `NavMenuIcon.tsx` |
| `subMenus` | `children` | recursive map |
| — | `end` | derive: `true` ถ้า leaf node (subMenus.length === 0) |
| `code` | — | ไม่ใช้ใน UI ตอนนี้ (เก็บไว้สำหรับ analytics / key อื่นได้) |

### ค่า `icon` ที่ frontend รองรับ

- ใช้ **whitelist** ใน `frontend/src/components/NavMenuIcon.tsx` (เพื่อ bundle size)
- รองรับรูปแบบ: **kebab-case** (`layout-dashboard`), **snake_case** (`layout_dashboard` → normalize เป็น kebab), หรือ **PascalCase** ของชื่อ Lucide (`LayoutDashboard`)
- ถ้า API ส่งค่าที่ยังไม่มีใน whitelist → ไม่แสดง icon (ข้อความเมนูยังแสดงตามปกติ) — เพิ่ม mapping ใน `ICON_MAP` ได้เมื่อมีเมนูใหม่
- ตัวอย่างค่าที่ใช้กับ Lucide ชุดปัจจุบัน: `gamepad-2`, `book-text`, `calendar-days`, `chart-column-increasing` (และรูปแบบ PascalCase เช่น `Gamepad2`, `BookText`, `CalendarDays`, `ChartColumnIncreasing`)

## 3) Response ที่ frontend รองรับ (ลำดับ priority)

`menuService.ts` ตรวจ format อัตโนมัติ:

1. **`MenuItemDto[]`** ← **format หลัก** (ตรวจจาก `id:number + subMenus + code`)
2. `{ "items": NavItem[] }` ← legacy format
3. `{ "rows": MenuRow[] }` ← legacy flat-row format
4. `NavItem[]` ← legacy array format
5. Fallback → `mainNavItems` (static) ถ้าเรียกไม่สำเร็จหรือ array ว่าง

## 4) Flat row format (legacy — ไม่แนะนำ)

```ts
type MenuRow = {
  id: string
  parent_id: string | null
  label: string
  path: string
  sort_order: number
  match_end: boolean
}
```

## 5) Error Contract

### 401 Unauthorized

```json
{
  "code": "UNAUTHORIZED",
  "message": "Invalid or expired access token."
}
```

### 403 Forbidden

```json
{
  "code": "FORBIDDEN",
  "message": "You do not have permission to access this resource."
}
```

### 500 Internal Server Error

```json
{
  "code": "INTERNAL_ERROR",
  "message": "Unexpected server error."
}
```

## 6) Frontend behavior

- เรียก `GET /menus/me` ผ่าน `apiClient` พร้อม Bearer token อัตโนมัติ
- **ก่อน login** → แสดง `mainNavItems` (static: Home เท่านั้น)
- **หลัง login** → `NavItemsProvider` detect userId → enable query → fetch `/menus/me` → render เมนูตาม role
- ถ้าเรียกไม่สำเร็จ → fallback ไป `mainNavItems` อัตโนมัติ
- หลัง login/logout สำเร็จ → `invalidateQueries` เพื่อโหลดเมนูใหม่ (ผ่าน `useInvalidateNavMenus`)

## 7) Classroom — เช็คชื่อ (รายคาบ + หน้าแถว)

หน้า `/classroom/attendance` ใช้ `frontend/src/services/attendanceService.ts` + UI การ์ดใน `ClassroomAttendancePage` / `AttendanceStudentCard`

### สองฟีเจอร์ (แยกบริบทชัดเจน)

| ฟีเจอร์ | ผู้ใช้หลัก | ความหมาย |
|---------|-----------|-----------|
| **เช็คชื่อรายคาบเรียน** (`scope=period`) | ครูวิชา | ผูก**ตารางสอน** — แผ่นต่อคาบ/วิชา |
| **เช็คชื่อหน้าแถว** (`scope=homeroom`) | ครูประจำชั้น | รายชื่อ**ห้องเรียน** — ไม่ผูกวิชาแต่ละคาบ (ก่อนเข้าคาบ / รอบโฮมรูมตามกำหนดโรงเรียน) |

### UX ที่ frontend ออกแบบ

1. **เลือกฟีเจอร์ก่อน** — การ์ดสลับบน: รายคาบ vs หน้าแถว
2. **Smart detect (รายคาบ)** — `GET` **ไม่มี query** → backend จับคู่**คาบปัจจุบัน**จากเวลา + ตารางสอน + JWT
3. **หน้าแถววันนี้** — `GET ?scope=homeroom` (ไม่ส่ง `at`) → แผ่นหน้าแถวของวันปัจจุบัน
4. **Bulk upsert** — ค่าเริ่มต้น `present` แตะการ์ดเฉพาะข้อยกเว้น แล้ว `PUT` ครั้งเดียว
5. **แก้อดีต** — ใช้ **datetime picker** บนหน้า → ส่ง `at` (วัน+เวลา) ให้ backend ชี้ไปที่คาบหรือรอบหน้าแถวที่ถูกต้อง
6. **สถานะเชิงลึก** — รวม `cut_class` (โดดเรียน) สำหรับรายงานกิจการนักเรียน

### Endpoint เดียว (แนะนำ)

| Method | Path | Query | คำอธิบาย |
|--------|------|-------|----------|
| `GET` | `/classroom/attendance/roll-call` | *(ไม่มี)* | **รายคาบ — Smart detect** คาบปัจจุบัน |
| `GET` | `/classroom/attendance/roll-call` | `scope=homeroom` | **หน้าแถว — วันนี้** |
| `GET` | `/classroom/attendance/roll-call` | `at=YYYY-MM-DDTHH:mm` และ `scope=period` | **รายคาบ — ย้อนหลัง** ตามวัน-เวลา (ชี้คาบในวันนั้น) |
| `GET` | `/classroom/attendance/roll-call` | `at=...` และ `scope=homeroom` | **หน้าแถว — ย้อนหลัง** ตามวัน-เวลา (ชี้รอบหน้าแถว) |
| `PUT` | `/classroom/attendance/roll-call` | — | บันทึกทั้งแผ่น (body ด้านล่าง) |

รูปแบบ `at` ให้สอดคล้องกับ `<input type="datetime-local" />` (local time โรงเรียน ไม่มี timezone ในสตริง) — backend แปลงเป็น timezone ของโรงเรียนตามนโยบายของระบบ

**เลิกใช้ใน UI แล้ว:** `?date=YYYY-MM-DD` อย่างเดียว (ไม่มีเวลา) — ถ้า backend รองรับอยู่แล้วอาจเก็บไว้เป็น legacy แต่ frontend ปัจจุบันส่ง `at` + `scope` เป็นหลัก

### Response `GET` (ตัวอย่าง JSON)

รองรับ **camelCase / PascalCase** และห่อ `{ "data": ... }` ได้

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "classLabel": "ม.3/1",
  "sessionDate": "2026-05-10",
  "attendanceScope": "period",
  "smartMatched": true,
  "periodLabel": "คาบ 3",
  "subjectName": "คณิตศาสตร์",
  "periodStart": "10:20",
  "periodEnd": "11:10",
  "students": [
    {
      "studentId": "stu-001",
      "displayName": "สมชาย ใจดี",
      "seatNumber": "4",
      "avatarUrl": "https://example.com/avatars/stu-001.jpg",
      "status": "present",
      "note": null
    }
  ]
}
```

- `attendanceScope`: `"period"` | `"homeroom"` (optional — ถ้าไม่ส่ง UI ใช้ค่าจาก request)
- ฟิลด์บริบทคาบ / เวลา เป็น **optional** โดยเฉพาะแผ่นหน้าแถวที่อาจไม่มี `subjectName`

### Request `PUT` (body)

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "sessionDate": "2026-05-10",
  "students": [
    { "studentId": "stu-001", "status": "present", "note": null },
    { "studentId": "stu-002", "status": "cut_class", "note": null }
  ]
}
```

### ค่า `status`

| ค่า | ความหมาย |
|-----|-----------|
| `present` | มาเรียน (ค่าเริ่มต้น bulk) |
| `absent` | ขาด |
| `late` | สาย |
| `leave` | ลา (อนุมัติ) |
| `cut_class` | โดดเรียน (เช้ามา บ่ายหาย — รายงานกิจการนักเรียน) |
| `unknown` | ยังไม่ระบุ (จาก API เท่านั้น; ค่าว่างจะถูกมองเป็น `present`) |

ค่า `excused` จากระบบเก่า → frontend แมปเป็น `leave`

### การวนสถานะบนการ์ด (แตะการ์ด)

ลำดับวน: `present` → `absent` → `late` → `leave` → `cut_class` → `present`


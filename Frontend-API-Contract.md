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
    "icon": null,
    "subMenus": []
  },
  {
    "id": 2,
    "code": "configuration",
    "label": "Configuration",
    "path": "/config",
    "icon": null,
    "subMenus": [
      {
        "id": 3,
        "code": "user-management",
        "label": "User Management",
        "path": "/config/users",
        "icon": null,
        "subMenus": []
      },
      {
        "id": 4,
        "code": "permission",
        "label": "Permission",
        "path": "/config/permission",
        "icon": null,
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
| `subMenus` | `children` | recursive map |
| — | `end` | derive: `true` ถ้า leaf node (subMenus.length === 0) |
| `code`, `icon` | — | ไม่ใช้ใน NavItem ตอนนี้ |

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


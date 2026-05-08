## Page and Menu Design (Updated — aligned with ER Model v2)

> **อัพเดทล่าสุด**: 2026-04-26
> อิงจาก ER Diagram ใหม่ที่ประกอบด้วยตาราง:
> `Title`, `UserProfile`, `Contact`, `Address`, `system_status`,
> `UserRoles`, `Roles`, `Menus`, `Role_menu`

---

### Core Principles
- ทุก feature และทุกเมนูต้องรองรับ **Responsive Web Design (RWD)** เสมอ
- โทนสีหลักของระบบ: **พื้นหลังน้ำเงินเข้มโปร่งแสง (glass/dark blue)** + **ตัวอักษรขาว** + **ปุ่ม/เมนู active ส้มเข้ม / hover ส้มอ่อนโปร่งแสง**
- ฟอนต์หลัก: **Sarabun / TH Sarabun New fallback**
- UI ต้องรองรับทั้ง desktop และ mobile (touch target เหมาะสม, เมนูพับได้)

---

### Layout Concept
- Header แนวคล้าย Facebook web:
  - อยู่ด้านบนเต็มความกว้างจอ
  - ชิดซ้าย/ขวาจอ (ไม่เป็น card กลางจอ)
- Content area:
  - เมื่อเข้าเมนูที่มี children ให้แสดง **sub menu column ด้านซ้าย**
  - sub menu ต้อง **ซ่อน/แสดง (collapse/expand)** ได้
  - mobile ใช้ drawer สำหรับ sub menu

---

### Current Menu Structure (Static Fallback — Frontend)
ใช้เมื่อ API ไม่พร้อม หรือ user ยังไม่ login:
- Top menu:
  1. `Home` (`/`) — แสดงทุก role รวมถึง guest
  2. `Guide` (`/guide`)
  3. `Login` (`/login`) — ซ่อนเมื่อ login แล้ว
- Sub menu under `Guide`:
  - `คู่มือ` (`/guide`) [end=true]
  - `Q&A` (`/guide/qa`)

---

### Home Page Exception
- หน้า `Home` (`/`) เป็น landing สำหรับผู้ใช้ที่ยังไม่ login
- จึง **ไม่แสดง sub menu column** ที่หน้า Home
- เมื่อเข้า path ในกลุ่ม Guide จึงค่อยแสดง sub menu ซ้าย

---

### Login UX
- Login แสดงเป็น **Modal** (ไม่ใช่ full page)
- Overlay เป็น **โทนมืดโปร่งแสง + blur เบาๆ** ให้สอดคล้องกับธีมหลัก
- หลัง login สำเร็จ:
  - ปิด modal
  - refresh ข้อมูลเมนูตาม role ใหม่อัตโนมัติ

---

### Dynamic Menu by Role — ER Model Mapping

#### ER Tables ที่เกี่ยวข้องกับเมนู

| ER Table      | คอลัมน์สำคัญ                                            | บทบาท                                       |
|---------------|----------------------------------------------------------|----------------------------------------------|
| `Roles`       | `ID`, `CODE`, `NAME`, `DESCRIPTION`, `fk_system_status` | กำหนด role ในระบบ                           |
| `UserProfile` | `ID`, `FK_TITLE_ID`, `FIRST_NAME`, `LAST_NAME`, `STATUS` | ข้อมูลผู้ใช้ (แทน `profiles` เดิม)        |
| `UserRoles`   | `ID`, `FK_USER_PROFILE`, `FK_ROLE_CODE`, `DESCRIPTION`  | ความสัมพันธ์ user ↔ role **(1 user หลาย role)** |
| `Menus`       | `ID`, `CODE`, `LABEL`, `PARENT_CODE`, `PATH`, `TYPE`    | โครงสร้างเมนู (ใช้ CODE แทน UUID parent_id) |
| `Role_menu`   | `ID`, `FK_ROLE_CODE`, `FK_MENU_CODE`, `DESCRIPTION`     | เชื่อม role กับเมนูที่มองเห็นได้             |
| `system_status` | `ID`, `NAME`, `STATUS`                                | สถานะ active/inactive ของทุก entity         |

#### ความแตกต่างจาก Migration เดิม (Supabase)

| ประเด็น           | Migration เดิม (`role_menu.sql`)       | ER Model ใหม่                               |
|-------------------|-----------------------------------------|----------------------------------------------|
| User→Role         | 1 user : 1 role (`profiles.role_id`)   | **1 user : หลาย role** (`UserRoles` table)  |
| Role identifier   | UUID                                    | **CODE** (text slug เช่น `ADMIN`, `MEMBER`) |
| Menu identifier   | UUID (`parent_id` → UUID ref)           | **CODE** (`PARENT_CODE` → CODE ref)         |
| Menu status       | ไม่มี (ลบแถวเพื่อซ่อน)                 | **`fk_system_status`** (soft delete)        |
| Role status       | ไม่มี                                   | **`fk_system_status`**                      |
| User profile      | `profiles` (id, role_id, updated_at)   | **`UserProfile`** (ข้อมูลเต็ม + title + รูป) |
| Menu type field   | ไม่มี                                   | **`TYPE`** (แยก group/link/divider ได้)     |

---

### Navigation API Contract

#### Endpoint
```
GET /api/navigation
Authorization: Bearer <supabase_access_token>
```

#### Logic ใน .NET API (แนะนำ)
1. ถอด `sub` (user ID) จาก JWT → หา `UserProfile.ID`
2. JOIN `UserRoles` → ได้ list ของ `FK_ROLE_CODE`
3. JOIN `Role_menu` WHERE `FK_ROLE_CODE` IN (roles ของ user) → ได้ list `FK_MENU_CODE` (DISTINCT)
4. JOIN `Menus` WHERE `CODE` IN (menu codes) **AND** `fk_system_status` = active
5. Build tree โดยใช้ `PARENT_CODE` (null = top-level)
6. Sort ตาม `SORT_ORDER` (ดู concern ด้านล่าง)
7. ส่ง response format `{ "items": NavItem[] }`

#### Response Format (Frontend expects)
```json
{
  "items": [
    {
      "id": "home",
      "label": "Home",
      "to": "/",
      "end": true
    },
    {
      "id": "guide",
      "label": "Guide",
      "to": "/guide",
      "end": false,
      "children": [
        { "id": "guide-manual", "label": "คู่มือ", "to": "/guide", "end": true },
        { "id": "guide-qa", "label": "Q&A", "to": "/guide/qa", "end": false }
      ]
    }
  ]
}
```

#### TypeScript Types (Frontend — `config/navigation.ts`)
```ts
type NavSubItem = {
  id: string      // ← map จาก Menus.CODE
  label: string   // ← map จาก Menus.LABEL
  to: string      // ← map จาก Menus.PATH
  end?: boolean   // ← derive จาก Menus.TYPE หรือ field MATCH_END (ดู concern)
}

type NavItem = {
  id: string
  label: string
  to: string
  end?: boolean
  children?: NavSubItem[]
}

type NavigationResponse = {
  items: NavItem[]
}
```

---

### Concerns & Recommendations

#### ⚠️ 1. Multi-Role per User (สำคัญมาก)
- ER ใหม่ใช้ `UserRoles` (1 user : หลาย role) แทน `profiles.role_id` เดิม
- **Impact**: Logic ใน API ต้อง UNION/DISTINCT menu จากทุก role ของ user
- **แนะนำ**: ให้ `.NET API` handle การ merge + dedup tree ก่อนส่ง frontend

#### ⚠️ 2. ไม่มี `MATCH_END` / `end` field ชัดเจนใน Menus
- `Menus.TYPE` ใน ER ใหม่ทำหน้าที่แทน — แต่ยังไม่ได้กำหนด enum value
- `end: true/false` สำคัญสำหรับ React Router `NavLink` (active state matching)
- **แนะนำ Option A**: ใช้ `TYPE` enum เช่น `EXACT` / `PREFIX` / `GROUP` / `DIVIDER`
- **แนะนำ Option B**: เพิ่มคอลัมน์ `MATCH_END boolean` เข้าไปใน `Menus` โดยตรง

#### ⚠️ 3. ไม่มี `SORT_ORDER` ใน ER Menus
- ER ใหม่ไม่เห็น sort order field — ลำดับเมนูอาจไม่ถูกต้อง
- **แนะนำ**: เพิ่ม `SORT_ORDER int` ใน `Menus` table

#### ⚠️ 4. เมนู `Login` ควร dynamic ตาม auth state
- เมื่อ user login แล้ว ไม่ควรเห็นเมนู `Login`
- **แนะนำ**: เพิ่ม flag `IS_GUEST_ONLY boolean` ใน `Menus`
  หรือให้ API ไม่ส่งเมนู Login เมื่อมี valid JWT (เพราะ request มี Bearer token อยู่แล้ว)

#### ⚠️ 5. `system_status` ต้อง filter ทุก JOIN step
- ทุกตาราง (Roles, Menus, UserProfile) มี `fk_system_status`
- ต้อง filter active ในทุก JOIN — ถ้าลืมอาจโชว์เมนู/role ที่ถูก disable แล้ว
- **แนะนำ**: กำหนด active CODE เป็น constant ใน API เช่น `"ACTIVE"` และเพิ่ม test case

#### ℹ️ 6. Migration เดิม (Supabase) vs ER ใหม่
- Schema ใน `supabase/migrations/20260217120000_role_menu.sql` ยังเป็น schema เดิม
- ถ้าย้ายไป ER ใหม่ต้องเขียน migration ใหม่ (rename tables, เปลี่ยน FK จาก UUID เป็น CODE)
- **แนะนำ**: วางแผน migration เป็น steps พร้อม rollback plan

#### ℹ️ 7. `UserProfile` กับ `auth.users` Supabase
- ER ใหม่ใช้ `UserProfile` แทน `profiles`
- ยังต้องมี trigger `on_auth_user_created` → สร้าง `UserProfile` + `UserRoles` default role
- ต้องกำหนด default role ผ่าน `UserRoles` (หลาย role ได้) แทน FK เดิม

---

### Dynamic Menu by Role (Best Practice)
- React ใช้ Supabase สำหรับ **Auth เท่านั้น**
- ข้อมูล role/menu ให้เรียกผ่าน **.NET API**
- Frontend ใช้ `apiClient` แนบ Supabase token อัตโนมัติ
- Endpoint เมนูหลักที่ใช้: `GET /api/navigation`

### Frontend Behavior (ปัจจุบัน)
- เรียก `GET /api/navigation` ผ่าน `apiClient`
- ถ้าเรียกไม่สำเร็จ / format ไม่ถูกต้อง → fallback ไป `mainNavItems` (static)
- หลัง login สำเร็จ → `invalidate` TanStack Query → โหลดเมนูใหม่ตาม role อัตโนมัติ
- รองรับ response 4 รูปแบบ (ดู `Frontend-API-Contract.md`)

### API Contract Reference
- ดูรายละเอียด request/response ที่ไฟล์: `Frontend-API-Contract.md`
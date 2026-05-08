# School Web Application Project Plan

## Overview
This project is a web application for teachers and students to manage classroom activities, assignments, educational games, and progress tracking.

### Goals
- Support around 150 students
- Allow teachers to create and manage assignments
- Allow students to play games and submit homework
- Track learning progress and scores
- Use a modern, scalable, and cost-effective stack

## Recommended Tech Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod

### Backend
- ASP.NET Core 8 Web API
- EF Core
- Npgsql
- FluentValidation
- Serilog
- Swagger/OpenAPI

### Platform Services
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage

## Architecture

```text
[ React Web App ]
   |
   | HTTPS + JWT
   v
[ ASP.NET Core Web API ]
   |
   | EF Core / Npgsql
   v
[ Supabase PostgreSQL ]

[ Supabase Auth ] <---- React login/session
[ Supabase Storage ] <---- file upload/download
```

## Supabase Auth — After You Create a Project

1. **Copy API credentials** (Dashboard → **Project Settings** → **API**):
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY` (safe in the browser; never use the `service_role` key in the frontend)

2. **Configure the frontend environment** — copy `frontend/.env.example` to `frontend/.env` and fill in the values. `frontend/src/lib/env.ts` validates these at build/runtime.

3. **Turn on a sign-in method** (Dashboard → **Authentication** → **Providers**):
   - For email + password (what the current `LoginModal` uses), enable **Email** and optionally **Confirm email** per your product needs.
   - Under **Authentication** → **URL Configuration**, set **Site URL** (e.g. production domain) and **Redirect URLs** to include local dev (e.g. `http://localhost:5173` and any Vite port you use).

4. **Create a test user** (Dashboard → **Authentication** → **Users** → **Add user**) or use **Sign up** if you add a registration UI later.

5. **How this repo calls Auth**
   - **Browser session:** `frontend/src/lib/supabase/client.ts` creates the Supabase client from `env`. Login uses `supabase.auth.signInWithPassword` in `LoginModal`.
   - **Calling your .NET API:** `frontend/src/lib/api/apiClient.ts` reads the current session (`getSession` / `refreshSession`) and sends `Authorization: Bearer <access_token>` when `VITE_API_BASE_URL` is set. The API should validate that JWT (Supabase-issued) and map the user to roles/permissions in your domain.

6. **Backend alignment (ASP.NET)** — plan to validate Supabase JWTs (issuer, audience, signature via Supabase JWKS) and treat the API as the place for authorization rules; keep using Supabase only for identity/session on the client.

## Core Architecture Rules
- React handles UI and client-side interactions
- Supabase Auth handles authentication
- .NET API handles business logic and authorization
- PostgreSQL is the source of truth
- React should not directly handle critical business queries against the database

---

## AI Collaboration Conventions

> ข้อตกลงการทำงานร่วมกับ AI assistant (Antigravity) ในโปรเจคนี้

### สิ่งที่ AI ช่วยได้

| งาน | รายละเอียด |
|-----|------------|
| **เขียนโค้ด** | React components, pages, hooks, services, CSS/Tailwind |
| **ออกแบบ UI** | Generate mockup image ก่อน implement, dark glass theme |
| **Backend** | .NET API endpoints, EF Core queries, FluentValidation |
| **DB / Migration** | SQL migration scripts ตาม ER model |
| **เอกสาร** | อัพเดท Page-and-Menu-Design.md, Frontend-API-Contract.md, Project-plan.md |
| **Debug** | วิเคราะห์ error, แนะนำแนวทางแก้ไข |

### Prompt Pattern ที่แนะนำ

#### สร้างหน้าใหม่
```
สร้างหน้า [ชื่อหน้า] ที่ path [/path]
- แสดง: [ข้อมูลอะไร]
- ดึงข้อมูลจาก: [API endpoint หรือ table]
- เฉพาะ role: [admin / member / ทุกคน]
- UI style: [ตามธีมที่มี หรือ specify เพิ่ม]
```

#### เพิ่ม / แก้ไข Feature
```
ใน [ชื่อไฟล์ หรือ component]
แก้ให้: [ต้องการอะไร]
เหตุผล: [context หรือที่มา]
```

#### สร้าง .NET API Endpoint
```
เขียน .NET API endpoint [METHOD] [path]
- อ่านจาก table: [ตาม ER model]
- Business logic: [กฎ เช่น filter by role, check system_status]
- Response format: [ตาม Frontend-API-Contract.md]
```

#### ขอ Design ก่อน Implement
```
ออกแบบ UI หน้า [ชื่อ] ให้ดูก่อน
concept: [เช่น dark glass theme, card layout]
ข้อมูลที่แสดง: [list รายการ]
```

### Tips เพิ่มเติม

- **บอก table/field จาก ER** → AI จะ map ได้ถูกต้อง เช่น `ใช้ Menus.LABEL, Menus.PATH`
- **บอก role** → `เฉพาะ admin` / `member ขึ้นไป` / `ทุกคนรวม guest`
- **บอก flow** → เช่น `กด save → POST → toast success → กลับ list`
- **แนบ error** → paste error message หรืออธิบาย bug ได้เลย
- **บอกไฟล์ที่เกี่ยว** → เช่น `แก้ที่ menuService.ts`

### Reference Documents

| ไฟล์ | วัตถุประสงค์ |
|------|-------------|
| `Project-plan.md` | Overview, tech stack, architecture, ข้อตกลง AI |
| `Page-and-Menu-Design.md` | Layout, menu structure, ER mapping, concerns |
| `Frontend-API-Contract.md` | Request/response format ทุก endpoint |
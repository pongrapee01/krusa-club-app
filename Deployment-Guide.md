# Deployment Guide — Krusa Club

> Stack: **React + Vite** (Frontend) · **ASP.NET Core 8** (Backend) · **Supabase** (Auth + PostgreSQL + Storage)  
> อัพเดทล่าสุด: 2026-04-26

---

## สรุป Architecture การ Deploy

```text
                  ┌─────────────────┐
  Browser ──────► │  Vercel / CDN   │  ← React + Vite (Static)
                  └────────┬────────┘
                           │ HTTPS + JWT
                  ┌────────▼────────┐
                  │  .NET API Host  │  ← Azure App Service / Railway / Render
                  └────────┬────────┘
                           │ EF Core / Npgsql
                  ┌────────▼────────┐
                  │  Supabase PG    │  ← PostgreSQL (managed)
                  └─────────────────┘

  Supabase Auth ◄──── React (login/session only)
  Supabase Storage ◄──── .NET API (file upload/download)
```

---

## 1. Frontend — Vite + React บน Vercel (คู่มือละเอียด)

### ทำไม Vercel
- รองรับ Vite out-of-the-box ไม่ต้อง config build เพิ่ม
- Auto deploy ทุกครั้งที่ push to `main` branch
- Preview deployment ทุก PR อัตโนมัติ (URL แยกสำหรับ test)
- Global CDN + HTTPS ฟรี
- Free tier รองรับโปรเจคขนาดนี้ได้สบาย

---

### ขั้นตอนที่ 1 — เตรียม GitHub Repository

> ⚠️ Vercel ต้องเชื่อมกับ Git repository เสมอ (GitHub / GitLab / Bitbucket)

#### 1.1 ตรวจสอบว่า `.env` ไม่หลุดขึ้น Git

```bash
# ใน terminal ที่ root ของ repo
git status
```

ต้องไม่เห็น `.env` ใน list — ถ้าเห็นให้รัน:
```bash
# เพิ่ม .env เข้า gitignore และลบออกจาก tracking
git rm --cached frontend/.env
git commit -m "chore: remove .env from tracking"
```

#### 1.2 Push โค้ดขึ้น GitHub
```bash
git add .
git commit -m "chore: add vercel.json and fix vite config for production"
git push origin main
```

---

### ขั้นตอนที่ 2 — สร้าง Vercel Account และ Import Project

1. ไปที่ **[vercel.com](https://vercel.com)**
2. คลิก **"Sign Up"** → เลือก **"Continue with GitHub"** (แนะนำ)
3. หน้า Dashboard → คลิก **"Add New..."** → **"Project"**
4. เลือก repository `krusa-club` จาก GitHub
5. คลิก **"Import"**

---

### ขั้นตอนที่ 3 — ตั้งค่า Build Configuration

Vercel จะ detect เป็น Vite อัตโนมัติ แต่ต้องตั้ง **Root Directory** ให้ถูกต้องเพราะ frontend อยู่ใน subfolder:

| Setting | ค่าที่ต้องตั้ง |
|---------|--------------|
| **Framework Preset** | Vite (detect อัตโนมัติ) |
| **Root Directory** | `frontend` ← **สำคัญมาก** |
| **Build Command** | `npm run build` (default ถูกแล้ว) |
| **Output Directory** | `dist` (default ถูกแล้ว) |
| **Install Command** | `npm install` (default ถูกแล้ว) |

> ถ้าไม่ตั้ง Root Directory = `frontend` Vercel จะหา `package.json` ไม่เจอ และ build fail

---

### ขั้นตอนที่ 4 — ตั้ง Environment Variables

ใน Vercel → หน้า Configure Project → เลื่อนลงหา **"Environment Variables"**

เพิ่มทีละตัว:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xxxxxxxxxxxx.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Production, Preview, Development |
| `VITE_API_BASE_URL` | `https://your-api.railway.app` | Production |
| `VITE_API_BASE_URL` | `https://your-staging-api.railway.app` | Preview |

#### วิธีหาค่า Supabase
```
Supabase Dashboard
  → เลือก Project
  → Project Settings (เฟืองด้านซ้าย)
  → API
  → Project URL        ← นี่คือ VITE_SUPABASE_URL
  → anon / public key  ← นี่คือ VITE_SUPABASE_ANON_KEY
```

> ❌ **ห้ามใช้** `service_role` key — ใช้เฉพาะ `anon` key ในฝั่ง browser

---

### ขั้นตอนที่ 5 — Deploy!

คลิก **"Deploy"** → รอประมาณ 1-2 นาที

Vercel จะรัน:
```bash
cd frontend
npm install
npm run build   # = tsc -b && vite build
```

เมื่อเสร็จจะได้ URL เช่น: `https://krusa-club.vercel.app`

---

### ขั้นตอนที่ 6 — ตั้ง Supabase Redirect URLs

> ⚠️ ถ้าข้ามขั้นตอนนี้ → Login จะ error ใน production

```
Supabase Dashboard
  → Authentication
  → URL Configuration
  → Site URL: https://krusa-club.vercel.app
  → Redirect URLs: เพิ่ม:
      https://krusa-club.vercel.app
      https://krusa-club.vercel.app/**
      http://localhost:5173          ← เก็บไว้สำหรับ local dev
```

---

### ขั้นตอนที่ 7 — ทดสอบหลัง Deploy

- [ ] เปิด URL production → หน้า Home โหลดได้
- [ ] กด Refresh ที่หน้า `/guide` → ต้องไม่ขึ้น 404 (เพราะมี `vercel.json` แล้ว)
- [ ] Login → modal ขึ้น, login สำเร็จ, เมนูเปลี่ยนตาม role
- [ ] เปิด DevTools → Console ต้องไม่มี error เกี่ยวกับ env vars

---

### ขั้นตอนที่ 8 — Auto Deploy (ทำงานอัตโนมัติจากนี้)

```
push to main  →  Vercel build + deploy อัตโนมัติ
open PR       →  Vercel สร้าง Preview URL ให้ test ก่อน merge
```

ไม่ต้องทำอะไรเพิ่ม — ทุก `git push origin main` = deploy ทันที

---

### ไฟล์ที่เพิ่มเข้าโปรเจคแล้ว

#### `frontend/vercel.json`
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```
- `rewrites` → แก้ปัญหา 404 เมื่อ refresh ที่ path เช่น `/guide`
- `assets` cache → browser cache ไฟล์ JS/CSS นาน 1 ปี (Vite ใส่ hash ใน filename เสมอ)
- Security headers → ป้องกัน clickjacking, MIME sniffing

#### `frontend/vite.config.ts` (แก้แล้ว)
- Proxy ทำงานเฉพาะ `development` mode
- `production` build ไม่มี proxy — ใช้ `VITE_API_BASE_URL` จริงแทน

#### `frontend/.gitignore` (เพิ่มแล้ว)
- เพิ่ม `.env`, `.env.local`, `.env.production` ฯลฯ ครบทุก variant

---

### Troubleshooting ที่พบบ่อย

| อาการ | สาเหตุ | วิธีแก้ |
|-------|--------|--------|
| Build fail: "Cannot find module" | Root Directory ตั้งไม่ถูก | ตั้ง Root Directory = `frontend` |
| 404 เมื่อ refresh | ไม่มี `vercel.json` | เพิ่มไฟล์ `vercel.json` (ทำแล้ว) |
| Login error: "Invalid redirect" | Supabase redirect URL ไม่มี production domain | เพิ่ม URL ใน Supabase dashboard |
| API ไม่ตอบ | `VITE_API_BASE_URL` ผิดหรือไม่ได้ตั้ง | ตรวจ Vercel Environment Variables |
| Blank screen หลัง deploy | `VITE_SUPABASE_URL` หรือ `ANON_KEY` ผิด | ตรวจ Vercel Environment Variables |
| TypeScript error ตอน build | Type error ที่ผ่าน dev ได้ แต่ `tsc -b` เข้มกว่า | แก้ type error ใน code |



---

## 2. Backend — ASP.NET Core 8

### แนะนำ: **Railway** (ง่าย) หรือ **Azure App Service** (enterprise)

| Platform | เหมาะกับ | ราคาเริ่มต้น |
|----------|---------|------------|
| **Railway** | ทีมเล็ก, เร็ว, ไม่ต้องการ infra | ~$5/เดือน |
| **Render** | คล้าย Railway, free tier มี sleep | ฟรี (sleep) / $7/เดือน |
| **Azure App Service** | .NET native, enterprise | ~$13/เดือน (B1) |
| **Fly.io** | Docker-based, global edge | ~$3/เดือน |

### Deploy บน Railway (แนะนำ)
1. สร้าง `Dockerfile` ใน project root ของ .NET:
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "YourApp.dll"]
```
2. Push to GitHub → Railway detect Dockerfile อัตโนมัติ
3. ตั้ง Environment Variables ใน Railway dashboard
4. ตั้ง `PORT=8080` ให้ตรงกับ Dockerfile

### CORS — ต้องตั้งให้ถูกต้อง
```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", policy =>
    {
        policy.WithOrigins("https://your-app.vercel.app")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ใช้ policy ที่ต่างกันระหว่าง dev/prod
app.UseCors(app.Environment.IsDevelopment() ? "Development" : "Production");
```

---

## 3. Environment Variables

### ⚠️ กฎเหล็ก
- **ห้าม** commit `.env` หรือ secret ใดๆ ขึ้น Git เด็ดขาด
- ตรวจสอบว่า `.gitignore` มี `.env*` แล้ว
- ใช้ secret manager ของแต่ละ platform

### Frontend (Vercel Environment Variables)

| Variable | ค่า | หมายเหตุ |
|----------|-----|---------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | จาก Supabase dashboard |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | anon public key (ใช้ใน browser ได้) |
| `VITE_API_BASE_URL` | `https://your-api.railway.app` | URL ของ .NET API |

> **ห้ามใช้** `service_role` key ฝั่ง frontend เด็ดขาด

### Backend (.NET — appsettings / Environment)

| Variable | ค่า | หมายเหตุ |
|----------|-----|---------|
| `ConnectionStrings__Default` | `Host=...;Database=...;Username=...;Password=...` | Supabase PG connection string |
| `Supabase__Url` | `https://xxx.supabase.co` | สำหรับ validate JWT |
| `Supabase__JwtSecret` | `your-jwt-secret` | จาก Supabase → Settings → API → JWT Secret |
| `ASPNETCORE_ENVIRONMENT` | `Production` | ปิด Swagger ใน prod (ดูด้านล่าง) |

#### ดึง Connection String จาก Supabase
```
Dashboard → Settings → Database → Connection string → .NET (Npgsql format)
```
ใช้ **Transaction pooler** (port 6543) ถ้าไม่ได้ใช้ EF Core migration runtime  
ใช้ **Session pooler** (port 5432) หรือ direct ถ้า migrate ผ่าน EF Core

---

## 4. Supabase — Production Checklist

### Authentication
- [ ] ตั้ง **Site URL** = production domain (เช่น `https://your-app.vercel.app`)
- [ ] เพิ่ม **Redirect URLs** ครบทุก domain (prod + staging + localhost)
- [ ] ปิด **Email Confirm** หรือ config ให้เหมาะกับ UX ที่ต้องการ
- [ ] ตั้ง **Rate Limit** ป้องกัน brute force login

### Database
- [ ] เปิด **Row Level Security (RLS)** ทุก table ที่ expose ผ่าน Supabase client
- [ ] Review policies ว่า `authenticated` เท่านั้นที่ access ได้ (ไม่ใช่ `anon`)
- [ ] Backup: Supabase Pro มี daily backup อัตโนมัติ — ควรอัพเกรดก่อน production จริง

### Storage
- [ ] ตั้ง bucket policy ให้ถูกต้อง (public vs private)
- [ ] จำกัด file size + allowed MIME types

---

## 5. Database Migration

### ⚠️ อย่า run migration ตอน app startup ใน production

```csharp
// ❌ อย่าทำแบบนี้ใน production
app.Services.GetService<AppDbContext>()!.Database.Migrate();

// ✅ ทำแบบนี้แทน — run migration แยกต่างหาก
```

### วิธีที่แนะนำ
```bash
# run ก่อน deploy ทุกครั้งที่มี migration ใหม่
dotnet ef database update --connection "Host=...production..."

# หรือ generate SQL script แล้ว review ก่อน run
dotnet ef migrations script --idempotent -o migration.sql
```

### Supabase Migration (SQL files)
```bash
# ถ้าใช้ Supabase CLI
supabase db push
```
ไฟล์ migration อยู่ที่ `supabase/migrations/` — run ตามลำดับ timestamp เสมอ

---

## 6. Security Best Practices

### Frontend
- [ ] ไม่ expose secret ใดๆ ใน client bundle (ใช้แค่ `VITE_` public vars)
- [ ] ตั้ง **Content Security Policy (CSP)** header
- [ ] ใช้ HTTPS เสมอ (Vercel บังคับ by default)

### Backend (.NET)
- [ ] ปิด **Swagger UI** ใน production:
```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```
- [ ] Validate Supabase JWT ด้วย **JWKS** (ไม่ใช่ shared secret เพียงอย่างเดียว):
```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://xxx.supabase.co/auth/v1";
        options.Audience = "authenticated";
        // Supabase ใช้ RS256 — ดึง public key ผ่าน JWKS endpoint อัตโนมัติ
    });
```
- [ ] เปิด **HTTPS Redirection** และ **HSTS**
- [ ] ใช้ **Rate Limiting** middleware (ASP.NET Core 8 มี built-in)
- [ ] ไม่ return stack trace ใน production error response

### Database
- [ ] ใช้ connection string แบบ **SSL required**:
  `Ssl Mode=Require;Trust Server Certificate=false`
- [ ] ใช้ user ที่มีสิทธิ์ minimal (ไม่ใช้ `postgres` superuser ใน production)

---

## 7. CI/CD Pipeline (GitHub Actions)

### Frontend — Auto deploy via Vercel
Vercel connect กับ GitHub → push to `main` = deploy อัตโนมัติ ไม่ต้องทำอะไรเพิ่ม

### Backend — GitHub Actions + Railway/Azure

```yaml
# .github/workflows/deploy-api.yml
name: Deploy API

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'   # trigger เฉพาะเมื่อ backend เปลี่ยน

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'

      - name: Build
        run: dotnet build --configuration Release
        working-directory: backend/

      - name: Test
        run: dotnet test --no-build
        working-directory: backend/

      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: your-api-service-name
```

### Branch Strategy แนะนำ

```
main          → production deploy (Vercel + Railway)
staging       → staging environment (ทดสอบก่อน merge)
feature/*     → Preview deployment (Vercel PR preview)
```

---

## 8. Monitoring & Logging

### Frontend
- **Vercel Analytics** — page views, web vitals (ฟรีใน hobby plan)
- **Sentry** (แนะนำ) — catch runtime errors พร้อม stack trace:
```ts
// main.tsx
import * as Sentry from "@sentry/react";
Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN });
```

### Backend (.NET)
- โปรเจคใช้ **Serilog** อยู่แล้ว — ตั้ง sink ให้ส่ง log ไป:
  - **Seq** (self-hosted, ฟรี) — ดีสำหรับ dev/staging
  - **Azure Application Insights** — ถ้า deploy บน Azure
  - **Datadog / Grafana Loki** — ถ้าต้องการ production-grade

```csharp
// Program.cs — ตัวอย่าง Serilog production config
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .WriteTo.Console(new JsonFormatter())   // structured log สำหรับ cloud
    .WriteTo.Seq("http://seq-server:5341")  // optional
    .CreateLogger();
```

---

## 9. Checklist ก่อน Go Live

### Code
- [ ] ไม่มี `console.log` / debug code หลงเหลือ
- [ ] ไม่มี hardcode URL หรือ secret ใน code
- [ ] `.env` ไม่ถูก commit (ตรวจ `git log` ย้อนหลัง)
- [ ] Build ผ่านโดยไม่มี error / warning สำคัญ

### Infrastructure
- [ ] Domain + SSL certificate พร้อม
- [ ] CORS ตั้งถูก domain production แล้ว
- [ ] Environment variables ครบทุก platform
- [ ] Database migration run แล้ว
- [ ] Supabase redirect URLs อัพเดทแล้ว

### Testing
- [ ] Login/logout ทำงานได้บน production URL
- [ ] เมนูโหลดตาม role ได้ถูกต้อง
- [ ] API endpoints ที่สำคัญ response ถูกต้อง
- [ ] ทดสอบบน mobile (RWD)

### Monitoring
- [ ] Error tracking เปิดอยู่ (Sentry หรือเทียบเท่า)
- [ ] Log streaming ทำงาน
- [ ] Health check endpoint พร้อม: `GET /health`

---

## 10. Cost Estimate (เบื้องต้น)

| Service | Plan | ราคา/เดือน |
|---------|------|------------|
| Vercel (Frontend) | Hobby | ฟรี |
| Railway (Backend) | Starter | ~$5 |
| Supabase | Free tier | ฟรี (500MB DB, 1GB storage) |
| Supabase | Pro (ถ้าต้องการ backup) | $25 |
| **รวม minimum** | | **~$5/เดือน** |

> Supabase Free tier รองรับ 150 users ได้สบายมาก — อัพเกรดเป็น Pro ก็ต่อเมื่อต้องการ daily backup หรือ custom domain สำหรับ Auth

---

## Reference
- [Vercel Vite Deployment](https://vercel.com/docs/frameworks/vite)
- [Railway .NET Docker Deploy](https://docs.railway.app/guides/dotnet)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [ASP.NET Core JWT + Supabase](https://supabase.com/docs/guides/auth/server-side/dotnet)

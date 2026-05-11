import { z } from 'zod'

const EnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_API_BASE_URL: z.string().url().optional(),
  /** ตั้งเป็น `true` เพื่อโหลดรายชื่อเช็คชื่อแบบ mock บนหน้า `/classroom/attendance` โดยไม่ต้องมี API */
  VITE_USE_ATTENDANCE_MOCK: z.string().optional(),
})

export type Env = z.infer<typeof EnvSchema>

export const env: Env = EnvSchema.parse(import.meta.env)


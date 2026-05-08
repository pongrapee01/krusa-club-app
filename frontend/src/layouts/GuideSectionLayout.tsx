import { Outlet } from 'react-router-dom'

/** แยก segment `/guide` / `/guide/qa` — ไม่เพิ่ม UI ซ้ำ (ใช้ shell จาก RootLayout) */
export function GuideSectionLayout() {
  return <Outlet />
}

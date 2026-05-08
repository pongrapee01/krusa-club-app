import { createBrowserRouter } from 'react-router-dom'

import { LoginModalLayout } from '@/layouts/LoginModalLayout'
import { RootLayout } from '@/layouts/RootLayout'
import { GuideSectionLayout } from '@/layouts/GuideSectionLayout'
import { GuideManualPage } from '@/pages/GuideManualPage'
import { GuideQAPage } from '@/pages/GuideQAPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ClassroomPage } from '@/pages/ClassroomPage'
import { ConfigMasterPage } from '@/pages/ConfigMasterPage'
import { ConfigPage } from '@/pages/ConfigPage'
import { ConfigPermissionsPage } from '@/pages/ConfigPermissionsPage'
import { ConfigUsersPage } from '@/pages/ConfigUsersPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PlaygroundPage } from '@/pages/PlaygroundPage'
import { SchedulePage } from '@/pages/SchedulePage'
import { RegisterPage } from '@/pages/RegisterPage'

/** เพิ่ม path ใหม่: ใส่ route ที่นี่ และเพิ่มรายการใน `src/config/navigation.ts` ให้เมนูตรงกัน */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        element: <LoginModalLayout />,
        children: [
          { index: true, element: <HomePage /> },
          {
            path: 'guide',
            element: <GuideSectionLayout />,
            children: [
              { index: true, element: <GuideManualPage /> },
              { path: 'qa', element: <GuideQAPage /> },
            ],
          },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'classroom', element: <ClassroomPage /> },
          { path: 'schedule', element: <SchedulePage /> },
          { path: 'playground', element: <PlaygroundPage /> },
          { path: 'config', element: <ConfigPage /> },
          { path: 'config/master', element: <ConfigMasterPage /> },
          { path: 'config/users', element: <ConfigUsersPage /> },
          { path: 'config/permissions', element: <ConfigPermissionsPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'login', element: <HomePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])


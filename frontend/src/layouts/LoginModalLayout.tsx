import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { LoginModal } from '@/components/LoginModal'

export function LoginModalLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const showLogin = location.pathname === '/login'

  const handleClose = () => {
    navigate('/', { replace: true })
  }

  return (
    <>
      <Outlet />
      {showLogin && <LoginModal onClose={handleClose} />}
    </>
  )
}

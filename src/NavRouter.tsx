import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Home } from './pages/Home'
import { Group } from './pages/Group'
import { Login } from './pages/Login'
import { MyRequests } from './pages/MyRequests'
import { MyPredictions } from './pages/MyPredictions'
import { MyBets } from './pages/MyBets'
import { wsService } from './services/websocket'
import { useAppSelector } from './hooks/useRedux'
import Header from './components/header'

export default function NavRouter() {
  const user = useAppSelector((state) => state.auth.user)

  useEffect(() => {
    if (user) wsService.connect()
    else wsService.disconnect()

    return () => {
      wsService.disconnect()
    }
  }, [user])

  return (
    <BrowserRouter>
      <Header />
      <main>
        <ScrollToTop />
        <Routes>
          {/* Protected routes */}
          <Route element={<LayoutProtected />}>
            <Route path='/my-requests' element={<MyRequests />} />
            <Route path='/my-predictions' element={<MyPredictions />} />
            <Route path='/my-bets' element={<MyBets />} />
          </Route>

          {/* Auth-only routes (redirect if already authenticated) */}
          <Route element={<LayoutNotAuthed />}>
            <Route path='/login' element={<Login />} />
          </Route>

          {/* Public routes */}
          <Route path='/politics' element={<Home />} />
          <Route path='/sport' element={<Home />} />
          <Route path='/finance' element={<Home />} />
          <Route path='/crypto' element={<Home />} />
          <Route path='/geopolitics' element={<Home />} />
          <Route path='/technology' element={<Home />} />
          <Route path='/culture' element={<Home />} />
          <Route path='/world' element={<Home />} />
          <Route path='/economy' element={<Home />} />
          <Route path='/elections' element={<Home />} />
          <Route path='/mentions' element={<Home />} />
          <Route path='/other' element={<Home />} />
          <Route path='/' element={<Home />} />
          <Route path='/group' element={<Group />} />

          {/* 404 fallback */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

// Layout for protected routes
function LayoutProtected() {
  const user = useAppSelector((state) => state.auth.user)
  if (!user) return <Navigate to='/login' replace />
  return <Outlet />
}

// Layout for auth-only routes (login page)
function LayoutNotAuthed() {
  const user = useAppSelector((state) => state.auth.user)
  if (user) return <Navigate to='/' replace />
  return <Outlet />
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

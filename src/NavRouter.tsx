import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { Group } from './pages/Group'
import { Requests } from './pages/Requests'
import { Profile } from './pages/Profile'
import { wsManager } from './services/websocket'
import { useAppSelector } from './hooks/useRedux'
import Header from './components/header'
import Footer from './components/footer'
import { PredictionDetail } from './pages/PredictionDetail/page'
import { useGetConfigQuery } from './services/api'
import ModalLogin from './modals/login'
import Page404 from './pages/404'
import BackToTop from './components/totop'

export default function NavRouter() {
  useGetConfigQuery()

  useEffect(() => {
    wsManager.connect()
  }, [])

  return (
    <BrowserRouter>
      <ModalLogin />
      <Header />
      <main>
        <ScrollToTop />
        <BackToTop />
        <Routes>
          {/* Protected routes */}
          <Route element={<LayoutProtected />}>
            <Route path='/predictions' element={<Requests />} />
            <Route path='/profile' element={<Profile />} />
          </Route>

          {/* Auth-only routes (redirect if already authenticated) */}
          {/* <Route element={<LayoutNotAuthed />}>
            <Route path='/login' element={<Login />} />
          </Route> */}

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
          <Route path='/group/:id' element={<Group />} />
          <Route path='/prediction/:id' element={<PredictionDetail />} />
          <Route path='/' element={<Home />} />

          {/* 404 fallback */}
          <Route path='*' element={<Page404 />} />
          {/* <Route path='*' element={<Navigate to='/' replace />} /> */}
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}

// Layout for protected routes
function LayoutProtected() {
  const token = useAppSelector((state) => state.auth.token)
  if (!token) return <Navigate to='/login' replace />
  return <Outlet />
}

// Layout for auth-only routes (login page)
// function LayoutNotAuthed() {
//   const token = useAppSelector((state) => state.auth.token)
//   if (token) return <Navigate to='/' replace />
//   return <Outlet />
// }
// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [pathname])
  return null
}

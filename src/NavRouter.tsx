import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom'
import { useAppSelector } from './hooks/useRedux'
import { useGetConfigQuery } from './services/api'
import { ModalProvider } from './services/ModalContext'
import Header from './components/header'
import Footer from './components/footer'
import TapBar from './components/tapbar'
import BackToTop from './elements/totop'
import ModalRenderer from './elements/modal'
import Empty from './elements/empty'

const Home = lazy(() => import('./pages/Home'))
const Profile = lazy(() => import('./pages/Profile/page'))
const PageCreateRequest = lazy(() => import('./pages/Create'))
const PageUser = lazy(() => import('./pages/User'))
const PredictionDetail = lazy(() => import('./pages/PredictionDetail/page'))
const PageLeaderboard = lazy(() => import('./pages/Leaderboard'))
const Page404 = lazy(() => import('./pages/404'))
const PageTos = lazy(() => import('./pages/Tos'))
const PagePrivacy = lazy(() => import('./pages/Privacy'))
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'))

export default function NavRouter() {
  useGetConfigQuery()

  return (
    <ModalProvider>
      <BrowserRouter>
        <ModalRenderer />
        <Header />
        <main>
          <Suspense fallback={<Empty title='Загрузка...' loading={true} />}>
            <Routes>
              {/* Protected routes */}
              <Route element={<LayoutProtected />}>
                <Route path='/profile' element={<Profile />} />
                <Route path='/create' element={<PageCreateRequest />} />
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
              <Route path='/tech' element={<Home />} />
              <Route path='/culture' element={<Home />} />
              <Route path='/world' element={<Home />} />
              <Route path='/economy' element={<Home />} />
              <Route path='/elections' element={<Home />} />
              <Route path='/weather' element={<Home />} />
              <Route path='/other' element={<Home />} />
              <Route path='/user/:id' element={<PageUser />} />
              <Route path='/leaderboard' element={<PageLeaderboard />} />
              <Route path='/prediction/:id' element={<PredictionDetail />} />
              <Route path='/tos' element={<PageTos />} />
              <Route path='/privacy' element={<PagePrivacy />} />
              <Route path='/oauth/:provider' element={<OAuthCallback />} />
              <Route path='/' element={<Home />} />

              {/* 404 fallback */}
              <Route path='*' element={<Page404 />} />
              {/* <Route path='*' element={<Navigate to='/' replace />} /> */}
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <TapBar />
        <ScrollToTop />
        <BackToTop />
      </BrowserRouter>
    </ModalProvider>
  )
}

// Layout for protected routes
function LayoutProtected() {
  const { user, loading } = useAppSelector((state) => state.auth)
  if (!user && !loading) return <Navigate to='/' replace />
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
    if (window.scrollY > 0) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }, [pathname])
  return null
}

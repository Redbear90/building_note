import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ProtectedRoute from './ProtectedRoute'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const SignupOwnerPage = lazy(() => import('@/pages/SignupOwnerPage'))
const SignupMemberPage = lazy(() => import('@/pages/SignupMemberPage'))
const MapPage = lazy(() => import('@/pages/MapPage'))
const BuildingListPage = lazy(() => import('@/pages/BuildingListPage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={null}>{children}</Suspense>
)

export const router = createBrowserRouter([
  { path: '/login', element: <Page><LoginPage /></Page> },
  { path: '/signup', element: <Page><SignupOwnerPage /></Page> },
  { path: '/signup/join', element: <Page><SignupMemberPage /></Page> },

  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Page><MapPage /></Page>
      </ProtectedRoute>
    ),
  },
  {
    path: '/buildings',
    element: (
      <ProtectedRoute>
        <Page><BuildingListPage /></Page>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allow={['ADMIN', 'BUILDING_OWNER']}>
        <Page><AdminPage /></Page>
      </ProtectedRoute>
    ),
  },

  // 구버전 경로 호환 — 점진적 제거 가능
  { path: '/admin/login', element: <Navigate to="/login" replace /> },

  { path: '*', element: <Navigate to="/" replace /> },
])

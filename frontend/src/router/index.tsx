import { createBrowserRouter, Navigate } from 'react-router-dom'
import MapPage from '@/pages/MapPage'
import BuildingListPage from '@/pages/BuildingListPage'
import AdminLoginPage from '@/pages/AdminLoginPage'
import AdminPage from '@/pages/AdminPage'

/**
 * 애플리케이션 라우터 정의
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MapPage />,
  },
  {
    path: '/buildings',
    element: <BuildingListPage />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin',
    element: <AdminPage />,
  },
  {
    // 정의되지 않은 경로는 메인으로 리다이렉트
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

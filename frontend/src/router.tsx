import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/components/AppLayout'
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import DashboardPage from '@/pages/DashboardPage'
import LoginPage from '@/pages/LoginPage'
import ProductsPage from '@/pages/ProductsPage'
import CustomersPage from '@/pages/CustomersPage'
import OrderCreatePage from '@/pages/OrderCreatePage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    // Layout route tanpa path: semua anak di bawahnya wajib login.
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/products', element: <ProductsPage /> },
          { path: '/customers', element: <CustomersPage /> },
          { path: '/orders/new', element: <OrderCreatePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
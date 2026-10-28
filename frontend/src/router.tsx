import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '@/components/AppLayout'
import FullPageSpinner from '@/components/FullPageSpinner'
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import ErrorPage from '@/pages/ErrorPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Code splitting: tiap halaman menjadi berkas JS sendiri yang baru diunduh saat dibuka.
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const CustomersPage = lazy(() => import('@/pages/CustomersPage'))
const OrderCreatePage = lazy(() => import('@/pages/OrderCreatePage'))
const OrdersPage = lazy(() => import('@/pages/OrdersPage'))
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'))

export const router = createBrowserRouter([
  {
    // Rute tanpa path: hanya untuk memasang penangkap error di seluruh aplikasi.
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/login',
        element: (
          <Suspense fallback={<FullPageSpinner />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/', element: <DashboardPage /> },
              { path: '/products', element: <ProductsPage /> },
              { path: '/customers', element: <CustomersPage /> },
              { path: '/orders/new', element: <OrderCreatePage /> },
              { path: '/orders', element: <OrdersPage /> },
              { path: '/orders/:id', element: <OrderDetailPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
])
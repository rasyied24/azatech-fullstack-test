import { createBrowserRouter } from 'react-router-dom'
import SetupCheckPage from '@/pages/SetupCheckPage'

export const router = createBrowserRouter([{ path: '/', element: <SetupCheckPage /> }])
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicSite } from './pages/PublicSite'
import { SelfCheck } from './pages/SelfCheck'

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then((m) => ({ default: m.AdminLogin })))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile').then((m) => ({ default: m.AdminProfile })))
const AdminEvidence = lazy(() => import('./pages/admin/AdminEvidence').then((m) => ({ default: m.AdminEvidence })))
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects').then((m) => ({ default: m.AdminProjects })))
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages').then((m) => ({ default: m.AdminMessages })))

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<PublicSite />} />
            <Route path="/self-check" element={<SelfCheck />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminProfile />} />
              <Route path="evidence" element={<AdminEvidence />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="messages" element={<AdminMessages />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicSite } from './pages/PublicSite'
import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminProfile } from './pages/admin/AdminProfile'
import { AdminEvidence } from './pages/admin/AdminEvidence'
import { AdminProjects } from './pages/admin/AdminProjects'
import { AdminMessages } from './pages/admin/AdminMessages'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicSite />} />
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
      </AuthProvider>
    </BrowserRouter>
  )
}

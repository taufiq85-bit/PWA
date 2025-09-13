import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { AdminRoutes } from './AdminRoutes'
import { DosenRoutes } from './DosenRoutes'
import { MahasiswaRoutes } from './MahasiswaRoutes'
import { LaboranRoutes } from './LaboranRoutes'
import { ProfilePage } from '@/pages/ProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { UnauthorizedPage } from '@/pages/UnauthorizedPage'

export function PrivateRoutes() {
  const { currentRole } = useAuth()

  // Redirect based on role
  const getDashboardPath = () => {
    switch (currentRole) {
      case 'admin': return '/admin'
      case 'dosen': return '/dosen'
      case 'mahasiswa': return '/mahasiswa'
      case 'laboran': return '/laboran'
      default: return '/profile'
    }
  }

  return (
    <Routes>
      {/* Root redirect to appropriate dashboard */}
      <Route path="/" element={<Navigate to={getDashboardPath()} replace />} />
      
      {/* Role-based routes */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dosen/*" 
        element={
          <ProtectedRoute allowedRoles={['dosen']}>
            <DosenRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/mahasiswa/*" 
        element={
          <ProtectedRoute allowedRoles={['mahasiswa']}>
            <MahasiswaRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/laboran/*" 
        element={
          <ProtectedRoute allowedRoles={['laboran']}>
            <LaboranRoutes />
          </ProtectedRoute>
        } 
      />

      {/* Common protected routes */}
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
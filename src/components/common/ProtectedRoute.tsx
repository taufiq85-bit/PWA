import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  requireAuth?: boolean
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles = [],
  requireAuth = true,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, currentRole, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner />
  }

  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole || '')) {
    return <Navigate to="/unauthorized" replace />
  }

  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
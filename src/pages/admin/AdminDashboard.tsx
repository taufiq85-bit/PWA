// Update src/pages/admin/AdminDashboard.tsx
import { Sidebar } from '@/components/layout/Sidebar'
import { useLocation } from 'react-router-dom'

export function AdminDashboard() {
  const location = useLocation()

  return (
    <div className="flex h-screen">
      <Sidebar userRole="admin" currentPath={location.pathname} />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          {/* Dashboard content */}
        </div>
      </main>
    </div>
  )
}
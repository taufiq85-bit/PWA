import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'

export function AdminRoutes() {
  return (
    <Routes>
      {/* Main Dashboard */}
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      
      {/* User Management */}
      <Route path="/users" element={<div>Manajemen User - Coming Soon</div>} />
      <Route path="/users/:id" element={<div>User Detail - Coming Soon</div>} />
      <Route path="/users/create" element={<div>Create User - Coming Soon</div>} />
      <Route path="/users/:id/edit" element={<div>Edit User - Coming Soon</div>} />
      
      {/* Roles & Permissions */}
      <Route path="/roles" element={<div>Roles & Permissions - Coming Soon</div>} />
      <Route path="/roles/create" element={<div>Create Role - Coming Soon</div>} />
      <Route path="/roles/:id/edit" element={<div>Edit Role - Coming Soon</div>} />
      
      {/* Laboratory Management */}
      <Route path="/laboratories" element={<div>Laboratorium - Coming Soon</div>} />
      <Route path="/laboratories/:id" element={<div>Laboratory Detail - Coming Soon</div>} />
      <Route path="/laboratories/create" element={<div>Create Laboratory - Coming Soon</div>} />
      
      {/* Equipment Management */}
      <Route path="/equipments" element={<div>Peralatan - Coming Soon</div>} />
      <Route path="/equipments/:id" element={<div>Equipment Detail - Coming Soon</div>} />
      <Route path="/equipments/create" element={<div>Create Equipment - Coming Soon</div>} />
      
      {/* Announcements */}
      <Route path="/announcements" element={<div>Pengumuman - Coming Soon</div>} />
      <Route path="/announcements/create" element={<div>Create Announcement - Coming Soon</div>} />
      <Route path="/announcements/:id/edit" element={<div>Edit Announcement - Coming Soon</div>} />
      
      {/* System Analytics */}
      <Route path="/system/analytics" element={<div>Analytics - Coming Soon</div>} />
      <Route path="/system/settings" element={<div>System Settings - Coming Soon</div>} />
      <Route path="/system/logs" element={<div>System Logs - Coming Soon</div>} />
      
      {/* Redirect unknown paths */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
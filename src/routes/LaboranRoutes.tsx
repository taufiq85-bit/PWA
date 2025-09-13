import { Routes, Route, Navigate } from 'react-router-dom'
import { LaboranDashboard } from '@/pages/laboran/LaboranDashboard'

export function LaboranRoutes() {
  return (
    <Routes>
      {/* Main Dashboard */}
      <Route path="/" element={<LaboranDashboard />} />
      <Route path="/dashboard" element={<LaboranDashboard />} />
      
      {/* Inventaris Management */}
      <Route path="/inventaris" element={<div>Inventaris - Coming Soon</div>} />
      <Route path="/inventaris/create" element={<div>Create Inventaris - Coming Soon</div>} />
      <Route path="/inventaris/:id" element={<div>Inventaris Detail - Coming Soon</div>} />
      <Route path="/inventaris/:id/edit" element={<div>Edit Inventaris - Coming Soon</div>} />
      <Route path="/inventaris/import" element={<div>Import Inventaris - Coming Soon</div>} />
      <Route path="/inventaris/export" element={<div>Export Inventaris - Coming Soon</div>} />
      <Route path="/inventaris/stock-opname" element={<div>Stock Opname - Coming Soon</div>} />
      
      {/* Persetujuan (Badge: 5 pending) */}
      <Route path="/persetujuan" element={<div>Persetujuan (5 Pending!) - Coming Soon</div>} />
      <Route path="/persetujuan/:id" element={<div>Persetujuan Detail - Coming Soon</div>} />
      <Route path="/persetujuan/peminjaman" element={<div>Persetujuan Peminjaman - Coming Soon</div>} />
      <Route path="/persetujuan/booking" element={<div>Persetujuan Booking - Coming Soon</div>} />
      
      {/* Laboratorium Management */}
      <Route path="/laboratorium" element={<div>Laboratorium - Coming Soon</div>} />
      <Route path="/laboratorium/:id" element={<div>Laboratorium Detail - Coming Soon</div>} />
      <Route path="/laboratorium/:id/schedule" element={<div>Laboratorium Schedule - Coming Soon</div>} />
      <Route path="/laboratorium/:id/maintenance" element={<div>Laboratorium Maintenance - Coming Soon</div>} />
      
      {/* Laporan */}
      <Route path="/laporan" element={<div>Laporan - Coming Soon</div>} />
      <Route path="/laporan/peminjaman" element={<div>Laporan Peminjaman - Coming Soon</div>} />
      <Route path="/laporan/kerusakan" element={<div>Laporan Kerusakan - Coming Soon</div>} />
      <Route path="/laporan/inventaris" element={<div>Laporan Inventaris - Coming Soon</div>} />
      <Route path="/laporan/utilisasi" element={<div>Laporan Utilisasi - Coming Soon</div>} />
      
      {/* Redirect unknown paths */}
      <Route path="*" element={<Navigate to="/laboran" replace />} />
    </Routes>
  )
}
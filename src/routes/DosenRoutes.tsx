import { Routes, Route, Navigate } from 'react-router-dom'
import { DosenDashboard } from '@/pages/dosen/DosenDashboard'

export function DosenRoutes() {
  return (
    <Routes>
      {/* Main Dashboard */}
      <Route path="/" element={<DosenDashboard />} />
      <Route path="/dashboard" element={<DosenDashboard />} />
      
      {/* Mata Kuliah Management */}
      <Route path="/mata-kuliah" element={<div>Mata Kuliah - Coming Soon</div>} />
      <Route path="/mata-kuliah/create" element={<div>Create Mata Kuliah - Coming Soon</div>} />
      <Route path="/mata-kuliah/:id" element={<div>Mata Kuliah Detail - Coming Soon</div>} />
      <Route path="/mata-kuliah/:id/edit" element={<div>Edit Mata Kuliah - Coming Soon</div>} />
      <Route path="/mata-kuliah/:id/settings" element={<div>Mata Kuliah Settings - Coming Soon</div>} />
      
      {/* Jadwal Management */}
      <Route path="/jadwal" element={<div>Jadwal - Coming Soon</div>} />
      <Route path="/jadwal/create" element={<div>Create Jadwal - Coming Soon</div>} />
      <Route path="/jadwal/:id/edit" element={<div>Edit Jadwal - Coming Soon</div>} />
      <Route path="/jadwal/calendar" element={<div>Calendar View - Coming Soon</div>} />
      
      {/* Kuis Management (New Feature) */}
      <Route path="/kuis" element={<div>Kuis Management (New!) - Coming Soon</div>} />
      <Route path="/kuis/create" element={<div>Create Kuis - Coming Soon</div>} />
      <Route path="/kuis/:id" element={<div>Kuis Detail - Coming Soon</div>} />
      <Route path="/kuis/:id/edit" element={<div>Edit Kuis - Coming Soon</div>} />
      <Route path="/kuis/:id/builder" element={<div>Kuis Builder - Coming Soon</div>} />
      <Route path="/kuis/:id/preview" element={<div>Kuis Preview - Coming Soon</div>} />
      <Route path="/kuis/:id/results" element={<div>Kuis Results - Coming Soon</div>} />
      <Route path="/kuis/:id/analytics" element={<div>Kuis Analytics - Coming Soon</div>} />
      
      {/* Peminjaman Management */}
      <Route path="/peminjaman" element={<div>Peminjaman - Coming Soon</div>} />
      <Route path="/peminjaman/create" element={<div>Create Peminjaman - Coming Soon</div>} />
      <Route path="/peminjaman/:id" element={<div>Peminjaman Detail - Coming Soon</div>} />
      <Route path="/peminjaman/history" element={<div>Peminjaman History - Coming Soon</div>} />
      <Route path="/peminjaman/booking-laboratorium" element={<div>Booking Laboratorium - Coming Soon</div>} />
      <Route path="/peminjaman/booking-alat" element={<div>Booking Alat - Coming Soon</div>} />
      
      {/* Mahasiswa Management */}
      <Route path="/mahasiswa" element={<div>Data Mahasiswa - Coming Soon</div>} />
      <Route path="/mahasiswa/:id" element={<div>Mahasiswa Detail - Coming Soon</div>} />
      <Route path="/mahasiswa/:id/progress" element={<div>Mahasiswa Progress - Coming Soon</div>} />
      <Route path="/mahasiswa/:id/nilai" element={<div>Nilai Mahasiswa - Coming Soon</div>} />
      
      {/* Materi Management */}
      <Route path="/materi" element={<div>Materi - Coming Soon</div>} />
      <Route path="/materi/create" element={<div>Create Materi - Coming Soon</div>} />
      <Route path="/materi/:id" element={<div>Materi Detail - Coming Soon</div>} />
      <Route path="/materi/:id/edit" element={<div>Edit Materi - Coming Soon</div>} />
      <Route path="/materi/upload" element={<div>Upload Materi - Coming Soon</div>} />
      
      {/* Penilaian Management */}
      <Route path="/penilaian" element={<div>Penilaian - Coming Soon</div>} />
      <Route path="/penilaian/create" element={<div>Create Penilaian - Coming Soon</div>} />
      <Route path="/penilaian/:id/edit" element={<div>Edit Penilaian - Coming Soon</div>} />
      <Route path="/penilaian/rubrik" element={<div>Rubrik Penilaian - Coming Soon</div>} />
      <Route path="/penilaian/batch" element={<div>Batch Penilaian - Coming Soon</div>} />
      
      {/* Redirect unknown paths */}
      <Route path="*" element={<Navigate to="/dosen" replace />} />
    </Routes>
  )
}
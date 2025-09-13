import { Routes, Route, Navigate } from 'react-router-dom'
import { MahasiswaDashboard } from '@/pages/mahasiswa/MahasiswaDashboard'

export function MahasiswaRoutes() {
  return (
    <Routes>
      {/* Main Dashboard */}
      <Route path="/" element={<MahasiswaDashboard />} />
      <Route path="/dashboard" element={<MahasiswaDashboard />} />
      
      {/* Jadwal Praktikum */}
      <Route path="/jadwal" element={<div>Jadwal Praktikum - Coming Soon</div>} />
      <Route path="/jadwal/calendar" element={<div>Calendar Jadwal - Coming Soon</div>} />
      <Route path="/jadwal/:id" element={<div>Jadwal Detail - Coming Soon</div>} />
      
      {/* Kuis (Badge: 3 new) */}
      <Route path="/kuis" element={<div>Kuis (3 New!) - Coming Soon</div>} />
      <Route path="/kuis/:id" element={<div>Kuis Detail - Coming Soon</div>} />
      <Route path="/kuis/:id/attempt" element={<div>Kuis Attempt - Coming Soon</div>} />
      <Route path="/kuis/:id/result" element={<div>Kuis Result - Coming Soon</div>} />
      <Route path="/kuis/history" element={<div>Kuis History - Coming Soon</div>} />
      <Route path="/kuis/:id/review" element={<div>Kuis Review - Coming Soon</div>} />
      
      {/* Materi */}
      <Route path="/materi" element={<div>Materi - Coming Soon</div>} />
      <Route path="/materi/:id" element={<div>Materi Detail - Coming Soon</div>} />
      <Route path="/materi/:id/download" element={<div>Download Materi - Coming Soon</div>} />
      <Route path="/materi/:id/viewer" element={<div>Materi Viewer - Coming Soon</div>} />
      
      {/* Nilai */}
      <Route path="/nilai" element={<div>Nilai - Coming Soon</div>} />
      <Route path="/nilai/:id" element={<div>Nilai Detail - Coming Soon</div>} />
      <Route path="/nilai/transkrip" element={<div>Transkrip Nilai - Coming Soon</div>} />
      <Route path="/nilai/progress" element={<div>Progress Nilai - Coming Soon</div>} />
      
      {/* Pengumuman */}
      <Route path="/pengumuman" element={<div>Pengumuman - Coming Soon</div>} />
      <Route path="/pengumuman/:id" element={<div>Pengumuman Detail - Coming Soon</div>} />
      
      {/* Profil (bukan profile) */}
      <Route path="/profil" element={<div>Profil - Coming Soon</div>} />
      <Route path="/profil/edit" element={<div>Edit Profil - Coming Soon</div>} />
      <Route path="/profil/change-password" element={<div>Change Password - Coming Soon</div>} />
      
      {/* Redirect unknown paths */}
      <Route path="*" element={<Navigate to="/mahasiswa" replace />} />
    </Routes>
  )
}
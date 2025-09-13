// src/components/layout/DashboardLayout.tsx (sesuai struktur direktori)
import React from 'react'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/hooks/useAuth'
import { useLocation } from 'react-router-dom'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { currentRole } = useAuth()
  const location = useLocation()

  if (!currentRole) return null

  return (
    <div className="flex h-screen">
      <Sidebar 
        userRole={currentRole as 'admin' | 'dosen' | 'mahasiswa' | 'laboran'} 
        currentPath={location.pathname} 
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
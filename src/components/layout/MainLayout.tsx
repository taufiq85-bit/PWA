// src/components/layout/MainLayout.tsx
import { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

interface MainLayoutProps {
  children: React.ReactNode
  userRole: 'admin' | 'dosen' | 'mahasiswa' | 'laboran'
  userName?: string
  userAvatar?: string
  currentPath?: string
}

export function MainLayout({
  children,
  userRole,
  userName = 'User',
  userAvatar,
  currentPath,
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block">
          <Sidebar userRole={userRole} currentPath={currentPath} />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full">
              <Sidebar userRole={userRole} currentPath={currentPath} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            userName={userName}
            userRole={userRole}
            avatarUrl={userAvatar}
          />

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 lg:p-6">{children}</div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}

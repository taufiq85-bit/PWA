// src/components/layout/Sidebar.tsx
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, 
  Users, 
  FlaskConical, 
  Wrench, 
  Calendar, 
  FileQuestion, 
  Megaphone,
  BarChart3,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarItem {
  icon: React.ElementType
  label: string
  href: string
  badge?: string | number
  active?: boolean
}

interface SidebarProps {
  userRole: 'admin' | 'dosen' | 'mahasiswa' | 'laboran'
  currentPath?: string
  className?: string
}

const menuItems: Record<SidebarProps['userRole'], SidebarItem[]> = {
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Users, label: 'Manajemen User', href: '/admin/users' },
    { icon: Settings, label: 'Roles & Permissions', href: '/admin/roles' },
    { icon: FlaskConical, label: 'Laboratorium', href: '/admin/laboratories' },
    { icon: Wrench, label: 'Peralatan', href: '/admin/equipments' },
    { icon: Megaphone, label: 'Pengumuman', href: '/admin/announcements' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/system/analytics' },
  ],
  dosen: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dosen' },
    { icon: BookOpen, label: 'Mata Kuliah', href: '/dosen/mata-kuliah' },
    { icon: Calendar, label: 'Jadwal', href: '/dosen/jadwal' },
    { icon: FileQuestion, label: 'Kuis', href: '/dosen/kuis', badge: 'New' },
    { icon: ClipboardList, label: 'Peminjaman', href: '/dosen/peminjaman' },
    { icon: GraduationCap, label: 'Mahasiswa', href: '/dosen/mahasiswa' },
    { icon: BookOpen, label: 'Materi', href: '/dosen/materi' },
    { icon: BarChart3, label: 'Penilaian', href: '/dosen/penilaian' },
  ],
  mahasiswa: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/mahasiswa' },
    { icon: Calendar, label: 'Jadwal Praktikum', href: '/mahasiswa/jadwal' },
    { icon: FileQuestion, label: 'Kuis', href: '/mahasiswa/kuis', badge: 3 },
    { icon: BookOpen, label: 'Materi', href: '/mahasiswa/materi' },
    { icon: BarChart3, label: 'Nilai', href: '/mahasiswa/nilai' },
    { icon: Megaphone, label: 'Pengumuman', href: '/mahasiswa/pengumuman' },
    { icon: Users, label: 'Profil', href: '/mahasiswa/profil' },
  ],
  laboran: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/laboran' },
    { icon: Wrench, label: 'Inventaris', href: '/laboran/inventaris' },
    { icon: ClipboardList, label: 'Persetujuan', href: '/laboran/persetujuan', badge: 5 },
    { icon: FlaskConical, label: 'Laboratorium', href: '/laboran/laboratorium' },
    { icon: BarChart3, label: 'Laporan', href: '/laboran/laporan' },
  ]
}

export function Sidebar({ userRole, currentPath = '', className }: SidebarProps) {
  const items = menuItems[userRole] || []

  return (
    <div className={cn("flex h-full w-64 flex-col border-r bg-background", className)}>
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-sm font-semibold">SI Praktikum</h2>
            <p className="text-xs text-muted-foreground uppercase">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const isActive = currentPath === item.href
          const Icon = item.icon
          
          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-left",
                isActive && "bg-primary text-primary-foreground"
              )}
              asChild
            >
              <a href={item.href}>
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant={isActive ? "secondary" : "default"} className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </a>
            </Button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p>AKBID Mega Buana</p>
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
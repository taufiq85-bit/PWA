// src/types/user.ts

// Base user profile from database
export interface UserProfile {
  id: string
  nim: string | null
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  role_default: string | null
  created_at: string
  updated_at: string
  is_active: boolean
}

// User profile with computed fields
export interface EnhancedUserProfile extends UserProfile {
  roles: Role[]
  permissions: Permission[]
  currentRole?: Role
  displayName: string
  initials: string
  isOnline: boolean
  lastSeen?: string
}

// User creation data
export interface CreateUserData {
  email: string
  name: string
  nim?: string
  phone?: string
  role_default?: string
  avatar_url?: string
}

// User update data
export interface UpdateUserData {
  name?: string
  nim?: string
  phone?: string
  avatar_url?: string
  role_default?: string
}

// User list item (for admin panels)
export interface UserListItem {
  id: string
  nim: string | null
  name: string
  email: string
  roles: string[]
  is_active: boolean
  created_at: string
  last_login?: string
  avatar_url?: string
}

// User statistics
export interface UserStats {
  totalUsers: number
  activeUsers: number
  usersByRole: Record<string, number>
  recentRegistrations: number
  onlineUsers: number
}

// User search filters
export interface UserSearchFilters {
  search?: string
  role?: string
  status?: 'active' | 'inactive' | 'all'
  sortBy?: 'name' | 'email' | 'created_at' | 'last_login'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// User activity
export interface UserActivity {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, unknown>
  timestamp: string
  ipAddress: string
}

// Role definition
export interface Role {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

// Permission definition
export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description: string | null
  created_at: string
}

// User role assignment
export interface UserRole {
  id: string
  user_id: string
  role_id: string
  assigned_at: string
  is_active: boolean
  assigned_by?: string
}

// Extended user role with role details
export interface UserRoleWithDetails extends UserRole {
  role: Role
  permissions: Permission[]
}

// User enrollment (academic)
export interface UserEnrollment {
  id: string
  mahasiswa_id: string
  mata_kuliah_id: string
  enrolled_at: string
  is_active: boolean
  status: 'enrolled' | 'completed' | 'dropped'
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'id' | 'en'
  notifications: {
    email: boolean
    push: boolean
    inApp: boolean
  }
  dashboard: {
    layout: 'grid' | 'list'
    density: 'comfortable' | 'compact'
  }
}

// User session info
export interface UserSession {
  id: string
  userId: string
  deviceInfo: {
    userAgent: string
    ipAddress: string
    location?: string
  }
  loginAt: string
  lastActivity: string
  expiresAt: string
  isActive: boolean
}

// Profile form data
export interface ProfileFormData {
  name: string
  nim: string
  phone: string
  avatar?: File
}

// User import data (bulk operations)
export interface UserImportData {
  email: string
  name: string
  nim?: string
  phone?: string
  role: string
  password?: string
}

// User export data
export interface UserExportData extends UserListItem {
  permissions: string[]
  enrollments?: string[]
  lastActivity?: string
}

// Avatar upload response
export interface AvatarUploadResult {
  url: string
  publicUrl: string
  path: string
  fullPath: string
}

// User notification preferences
export interface NotificationPreferences {
  quiz_reminders: boolean
  assignment_due: boolean
  schedule_changes: boolean
  equipment_approved: boolean
  system_announcements: boolean
  email_digest: 'daily' | 'weekly' | 'never'
}

// User dashboard data
export interface UserDashboardData {
  profile: EnhancedUserProfile
  stats: {
    totalQuizzes?: number
    averageScore?: number
    completedCourses?: number
    upcomingSchedules?: number
  }
  recentActivity: UserActivity[]
  notifications: unknown[]
  quickActions: Array<{
    label: string
    href: string
    icon: string
  }>
}

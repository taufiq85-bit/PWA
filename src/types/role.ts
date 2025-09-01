// src/types/role.ts

// Role system types
export interface Role {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description: string | null
  created_at: string
}

// Role with permissions
export interface RoleWithPermissions extends Role {
  permissions: Permission[]
  userCount?: number
}

// Permission with roles
export interface PermissionWithRoles extends Permission {
  roles: Role[]
}

// Role assignment
export interface RoleAssignment {
  id: string
  user_id: string
  role_id: string
  assigned_at: string
  assigned_by: string | null
  is_active: boolean
}

// Permission assignment
export interface PermissionAssignment {
  id: string
  role_id: string
  permission_id: string
  created_at: string
}

// Role hierarchy
export interface RoleHierarchy {
  role: Role
  level: number
  parent?: Role
  children: Role[]
  inheritedPermissions: Permission[]
}

// Permission categories
export type PermissionResource =
  | 'users'
  | 'roles'
  | 'permissions'
  | 'laboratories'
  | 'equipments'
  | 'mata_kuliah'
  | 'kuis'
  | 'materi'
  | 'jadwal'
  | 'peminjaman'
  | 'booking'
  | 'inventaris'
  | 'nilai'
  | 'pengumuman'
  | 'system'

export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'approve'
  | 'publish'
  | 'export'
  | 'import'

// Permission check context
export interface PermissionContext {
  user_id: string
  roles: string[]
  resource: PermissionResource
  action: PermissionAction
  resource_id?: string
  additional_context?: Record<string, unknown>
}

// Role-based UI configuration
export interface RoleUIConfig {
  role: string
  navigation: NavigationItem[]
  dashboard: DashboardConfig
  permissions: Record<string, boolean>
}

interface NavigationItem {
  label: string
  href: string
  icon: string
  children?: NavigationItem[]
  permission?: string
}

interface DashboardConfig {
  widgets: DashboardWidget[]
  layout: 'grid' | 'list'
  quickActions: QuickAction[]
}

interface DashboardWidget {
  id: string
  title: string
  type: 'stats' | 'chart' | 'table' | 'calendar'
  size: 'small' | 'medium' | 'large'
  permission?: string
}

interface QuickAction {
  label: string
  href: string
  icon: string
  permission?: string
}

// System roles (predefined)
export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  DOSEN: 'dosen',
  MAHASISWA: 'mahasiswa',
  LABORAN: 'laboran',
} as const

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES]

// Permission patterns
export const PERMISSION_PATTERNS = {
  // Admin permissions
  SYSTEM_ADMIN: 'system:admin',
  USER_MANAGE: 'users:manage',
  ROLE_MANAGE: 'roles:manage',

  // Academic permissions
  COURSE_CREATE: 'mata_kuliah:create',
  COURSE_MANAGE: 'mata_kuliah:manage',
  QUIZ_CREATE: 'kuis:create',
  QUIZ_GRADE: 'kuis:grade',

  // Laboratory permissions
  LAB_MANAGE: 'laboratories:manage',
  EQUIPMENT_APPROVE: 'equipments:approve',
  BOOKING_APPROVE: 'booking:approve',

  // Student permissions
  QUIZ_ATTEMPT: 'kuis:attempt',
  MATERIAL_ACCESS: 'materi:read',
  SCHEDULE_VIEW: 'jadwal:read',
} as const

// Role templates for easy assignment
export interface RoleTemplate {
  name: string
  description: string
  permissions: string[]
  isDefault: boolean
}

export const ROLE_TEMPLATES: Record<SystemRole, RoleTemplate> = {
  admin: {
    name: 'Administrator',
    description: 'Full system access',
    permissions: [
      'system:admin',
      'users:manage',
      'roles:manage',
      'laboratories:manage',
      'equipments:manage',
    ],
    isDefault: false,
  },
  dosen: {
    name: 'Dosen',
    description: 'Teaching staff with course management access',
    permissions: [
      'mata_kuliah:create',
      'mata_kuliah:manage',
      'kuis:create',
      'kuis:grade',
      'materi:manage',
      'booking:create',
    ],
    isDefault: false,
  },
  mahasiswa: {
    name: 'Mahasiswa',
    description: 'Student with learning access',
    permissions: ['kuis:attempt', 'materi:read', 'jadwal:read', 'nilai:read'],
    isDefault: true,
  },
  laboran: {
    name: 'Laboran',
    description: 'Laboratory staff with inventory management',
    permissions: [
      'laboratories:manage',
      'equipments:manage',
      'booking:approve',
      'inventaris:manage',
    ],
    isDefault: false,
  },
}

// Permission validation
export interface PermissionValidator {
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  canAccess: (resource: PermissionResource, action: PermissionAction) => boolean
  canAccessResource: (
    resource: PermissionResource,
    resourceId: string
  ) => boolean
}

// Role management operations
export interface RoleManagementOperations {
  createRole: (data: Omit<Role, 'id' | 'created_at'>) => Promise<Role>
  updateRole: (id: string, data: Partial<Role>) => Promise<Role>
  deleteRole: (id: string) => Promise<void>
  assignPermission: (roleId: string, permissionId: string) => Promise<void>
  revokePermission: (roleId: string, permissionId: string) => Promise<void>
  assignRole: (userId: string, roleId: string) => Promise<void>
  revokeRole: (userId: string, roleId: string) => Promise<void>
}

// Permission inheritance
export interface PermissionInheritance {
  role: Role
  directPermissions: Permission[]
  inheritedPermissions: Permission[]
  effectivePermissions: Permission[]
}

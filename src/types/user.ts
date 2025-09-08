// src/types/user.ts
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

// ✅ Complete Role definition sesuai database schema
export interface Role {
  id: string
  role_name: string
  role_code: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ✅ Complete Permission definition sesuai database schema  
export interface Permission {
  id: string
  permission_code: string
  permission_name: string
  module: string
  action: string
  description: string | null
  created_at: string
  updated_at: string
}

// ✅ User Roles junction table
export interface UserRole {
  id: string
  user_id: string
  role_id: string
  assigned_at: string
  assigned_by: string | null
  is_active: boolean
}

// ✅ Role Permissions junction table
export interface RolePermission {
  id: string
  role_id: string
  permission_id: string
  assigned_at: string
}

// Enhanced user profile with computed fields
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

// User with roles response from database
export interface UserWithRoles {
  roles: Role
}

// Role with permissions response from database
export interface RoleWithPermissions {
  permissions: Permission
}
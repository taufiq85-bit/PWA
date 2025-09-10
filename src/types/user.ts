// src/types/user.ts - CORRECTED to match database schema
export interface UserProfile {
  id: string
  username?: string
  full_name: string // ✅ Changed from 'name' to 'full_name'
  email: string
  nim_nip?: string // ✅ Changed from 'nim' to 'nim_nip'
  phone?: string
  address?: string
  birth_date?: string
  avatar_url?: string
  role_default?: string
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
}

// ✅ Complete Role definition sesuai database schema
export interface Role {
  id: string
  role_name: string
  role_code: string
  description?: string // ✅ Made optional to match common patterns
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
  description?: string // ✅ Made optional to match common patterns
  created_at: string
  updated_at: string
}

// ✅ User Roles junction table
export interface UserRole {
  id: string
  user_id: string
  role_id: string
  assigned_at: string
  assigned_by?: string // ✅ Made optional
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
  full_name: string // ✅ Changed from 'name' to 'full_name'
  username?: string
  nim_nip?: string // ✅ Changed from 'nim' to 'nim_nip'
  phone?: string
  address?: string
  birth_date?: string
  role_default?: string
  avatar_url?: string
}

// User update data
export interface UpdateUserData {
  full_name?: string // ✅ Changed from 'name' to 'full_name'
  username?: string
  nim_nip?: string // ✅ Changed from 'nim' to 'nim_nip'
  phone?: string
  address?: string
  birth_date?: string
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

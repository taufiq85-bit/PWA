// src/lib/supabase.ts - FIX: Add custom types to remove 'any' and fix linter issues
import { createClient, User, Session } from '@supabase/supabase-js'

// Environment variables validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'sistem-praktikum-pwa',
    },
  },
})

// Auth state helpers
export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  return user
}

export const getCurrentSession = async (): Promise<Session | null> => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting current session:', error)
    return null
  }
  return session
}

// Enhanced connection test with RBAC validation
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔗 Testing Supabase connection...')

    // Test 1: Check if Supabase is reachable
    const { error: connectionError } = await supabase
      .from('users_profile')
      .select('count')
      .limit(1)

    if (connectionError && connectionError.code !== 'PGRST205') {
      console.error('❌ Supabase connection failed:', connectionError)
      return false
    }

    console.log('✅ Supabase connection successful')

    // Test 2: Check auth functionality
    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log('✅ Auth system accessible; user logged in:', !!user)

    // Test 3: Check RBAC tables existence
    try {
      const { error: rbacError } = await supabase
        .from('roles')
        .select('count')
        .limit(1)

      if (!rbacError) {
        console.log('✅ RBAC tables accessible')
      }
    } catch (_rbacError) {
      console.log('⚠️ RBAC tables not yet created (expected in development)')
    }

    return true
  } catch (error) {
    console.error('❌ Supabase connection error:', error)
    return false
  }
}

// Auth utilities
export const signInWithEmailPassword = async (
  email: string,
  password: string
) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export const signUpWithEmailPassword = async (
  email: string,
  password: string
) => {
  return await supabase.auth.signUp({
    email,
    password,
  })
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const updateUserPassword = async (password: string) => {
  return await supabase.auth.updateUser({ password })
}

// --- Custom Type Definitions for Database Helpers ---
interface Permission {
  id: string
  permission_code: string
  permission_name: string
  module: string
  action: string
  description: string
}

interface RolePermission {
  permissions: Permission
}

interface Role {
  id: string
  role_name: string
  role_code: string
  description: string
  is_active: boolean
  created_at: string
  role_permissions: RolePermission[]
}

interface UserRole {
  roles: Role
}

// Tipe untuk data saat membuat profil baru
type UserProfileInsert = {
  id: string
  full_name?: string
  nim?: string
  // Tambahkan properti lain yang wajib atau opsional di sini
}

// Tipe untuk data saat memperbarui profil
type UserProfileUpdate = {
  full_name?: string
  nim?: string
  avatar_url?: string
  updated_at?: string
  // Tambahkan properti lain yang bisa diupdate di sini
}
// ----------------------------------------------------

// Database helper functions - FIXED type issues
export const supabaseHelpers = {
  // Get user with complete profile and role information
  async getUserWithProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users_profile')
        .select(
          `
          *,
          user_roles!inner (
            roles!inner (
              id,
              role_name,
              role_code,
              description,
              is_active,
              role_permissions (
                permissions (
                  id,
                  permission_code,
                  permission_name,
                  module,
                  action,
                  description
                )
              )
            )
          )
        `
        )
        .eq('id', userId)
        .eq('user_roles.is_active', true)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user with profile:', error)
      throw error
    }
  },

  // Get user profile only
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  },

  // Get user roles with permissions - FIXED: Removed updated_at column
  async getUserRoles(userId: string): Promise<Role[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(
        `
        roles (
          id,
          role_name,
          role_code,
          description,
          is_active,
          created_at,
          role_permissions (
            permissions (
              id,
              permission_code,
              permission_name,
              module,
              action,
              description
            )
          )
        )
      `
      )
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching user roles:', error)
      return []
    }

    // FIX: Terapkan tipe UserRole yang sudah dibuat
    return (
      (data as unknown as UserRole[])?.map((ur) => ur.roles).filter(Boolean) ||
      []
    )
  },

  // Get user permissions (flattened from all roles)
  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const roles = await this.getUserRoles(userId)
      // FIX: Terapkan tipe Role dan RolePermission
      const permissions = roles.flatMap(
        (role: Role) =>
          role.role_permissions?.map((rp: RolePermission) => rp.permissions) ||
          []
      )

      // Remove duplicates based on permission_code
      const uniquePermissions = permissions.filter(
        (permission, index, self) =>
          permission &&
          index ===
            self.findIndex(
              (p) => p.permission_code === permission.permission_code
            )
      )

      return uniquePermissions.filter(Boolean) as Permission[]
    } catch (error) {
      console.error('Error fetching user permissions:', error)
      return []
    }
  },

  // Check if user has specific permission
  async userHasPermission(
    userId: string,
    permissionCode: string
  ): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId)
      // FIX: Terapkan tipe Permission
      return permissions.some(
        (p: Permission) => p.permission_code === permissionCode
      )
    } catch (error) {
      console.error('Error checking user permission:', error)
      return false
    }
  },

  // Create user profile
  async createUserProfile(profileData: UserProfileInsert) {
    // FIX: Gunakan tipe UserProfileInsert
    const { data, error } = await supabase
      .from('users_profile')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
    return data
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: UserProfileUpdate) {
    // FIX: Gunakan tipe UserProfileUpdate
    const { data, error } = await supabase
      .from('users_profile')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
    return data
  },

  // Get role by name or code - FIXED: This should work correctly with * selector
  async getRoleByName(roleName: string) {
    const { data, error } = await supabase
      .from('roles')
      .select(
        `
        *,
        role_permissions (
          permissions (
            id,
            permission_code,
            permission_name,
            module,
            action,
            description
          )
        )
      `
      )
      .or(`role_name.eq.${roleName},role_code.eq.${roleName}`)
      .single()

    if (error) {
      console.error('Error fetching role:', error)
      throw error
    }
    return data
  },

  // Assign role to user
  async assignRoleToUser(userId: string, roleId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error assigning role to user:', error)
      throw error
    }
    return data
  },

  // Remove role from user
  async removeRoleFromUser(userId: string, roleId: string) {
    const { error } = await supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('role_id', roleId)

    if (error) {
      console.error('Error removing role from user:', error)
      throw error
    }
  },

  // Get all available roles
  async getAllRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('is_active', true)
      .order('role_name')

    if (error) {
      console.error('Error fetching roles:', error)
      return []
    }
    return data || []
  },

  // Get all available permissions
  async getAllPermissions() {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('module, action')

    if (error) {
      console.error('Error fetching permissions:', error)
      return []
    }
    return data || []
  },
}

// Export types for TypeScript
export type { User, Session }
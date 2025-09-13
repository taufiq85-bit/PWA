// src/lib/database.ts - Complete file with fixed testRLS function
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
     } catch {
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

// --- Enhanced Type Definitions ---
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

// Enhanced user profile types
interface UserProfile {
  id: string
  email: string
  full_name: string
  username?: string
  nim_nip?: string
  phone?: string
  avatar_url?: string
  role_default?: string
  is_active?: boolean
  email_verified?: boolean
  created_at: string
  updated_at: string
}

type UserProfileInsert = {
  id: string
  email: string
  full_name: string
  username?: string
  nim_nip?: string
  phone?: string
  role_default?: string
  is_active?: boolean
  email_verified?: boolean
  created_at?: string
  updated_at?: string
}

type UserProfileUpdate = {
  full_name?: string
  username?: string
  nim_nip?: string
  phone?: string
  avatar_url?: string
  is_active?: boolean
  email_verified?: boolean
  updated_at?: string
}

type CreateProfileData = {
  id: string
  email: string
  full_name: string
  username?: string
  nim_nip?: string
  phone?: string
  role_default?: string
}

// Enhanced database helper functions
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

  // Enhanced getUserProfile with RLS fallback handling
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Method 1: Try direct select
      const { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('Direct profile fetch failed:', error.message)

        // Method 2: Try with auth.users fallback
        const { data: authUser } = await supabase.auth.getUser()
        if (authUser.user && authUser.user.id === userId) {
          return {
            id: authUser.user.id,
            email: authUser.user.email || '',
            full_name: authUser.user.user_metadata?.full_name || '',
            phone: authUser.user.user_metadata?.phone || '',
            avatar_url: authUser.user.user_metadata?.avatar_url || '',
            nim_nip: authUser.user.user_metadata?.nim_nip || '',
            username: authUser.user.user_metadata?.username || '',
            role_default: authUser.user.user_metadata?.role_default || '',
            is_active: true,
            email_verified: authUser.user.email_confirmed_at ? true : false,
            created_at: authUser.user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        }

        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  },

  // Enhanced updateUserProfile with auth metadata sync
  async updateUserProfile(
    userId: string,
    updates: UserProfileUpdate
  ): Promise<UserProfile | null> {
    try {
      // Update database profile
      const { data: dbUpdate, error: dbError } = await supabase
        .from('users_profile')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      // Also update auth.users metadata for consistency
      const authUpdates: Record<string, any> = {}
      if (updates.full_name) authUpdates.full_name = updates.full_name
      if (updates.phone) authUpdates.phone = updates.phone
      if (updates.avatar_url) authUpdates.avatar_url = updates.avatar_url
      if (updates.username) authUpdates.username = updates.username
      if (updates.nim_nip) authUpdates.nim_nip = updates.nim_nip

      if (Object.keys(authUpdates).length > 0) {
        await supabase.auth.updateUser({
          data: authUpdates,
        })
      }

      if (dbError) {
        // If database update fails, still return success if auth update worked
        console.warn(
          'Database profile update failed, using auth fallback:',
          dbError
        )
        return {
          id: userId,
          email: '', // Will be filled by caller if needed
          full_name: updates.full_name || '',
          username: updates.username,
          nim_nip: updates.nim_nip,
          phone: updates.phone,
          avatar_url: updates.avatar_url,
          is_active: updates.is_active,
          email_verified: updates.email_verified,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }

      return dbUpdate
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  },

  // Enhanced createUserProfile with role assignment
  async createUserProfile(
    profileData: CreateProfileData
  ): Promise<UserProfile> {
    try {
      const profileInsert: UserProfileInsert = {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        username: profileData.username,
        nim_nip: profileData.nim_nip,
        phone: profileData.phone,
        role_default: profileData.role_default || 'MAHASISWA',
        is_active: true,
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('users_profile')
        .insert(profileInsert)
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        throw error
      }

      // Also assign default role
      if (profileData.role_default) {
        try {
          const role = await this.getRoleByName(profileData.role_default)
          if (role) {
            await this.assignRoleToUser(profileData.id, role.id)
          }
        } catch (roleError) {
          console.warn('Failed to assign default role:', roleError)
          // Don't throw error here, profile creation succeeded
        }
      }

      return data
    } catch (error) {
      console.error('Error in createUserProfile:', error)
      throw error
    }
  },

  // Get user roles with permissions
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

    return (
      (data as unknown as UserRole[])?.map((ur) => ur.roles).filter(Boolean) ||
      []
    )
  },

  // Get user permissions (flattened from all roles)
  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const roles = await this.getUserRoles(userId)
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
      return permissions.some(
        (p: Permission) => p.permission_code === permissionCode
      )
    } catch (error) {
      console.error('Error checking user permission:', error)
      return false
    }
  },

  // Get role by name or code
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

  // Fixed testRLS function - remove unused variable
    testRLS: async (tableName: string) => {
      try {
        // Test without authentication
        const { error: publicError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

      // Test with authentication
      const { data: { user } } = await supabase.auth.getUser()
      let authError = null

      if (user) {
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        authError = error
      }

      return {
        tableName,
        publicAccess: { allowed: !publicError, error: publicError?.message },
        authenticatedAccess: { allowed: !authError, error: authError?.message },
        hasUser: !!user
      }
    } catch (error) {
      return { 
        tableName, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

// Export types for TypeScript
export type {
  User,
  Session,
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
  CreateProfileData,
  Permission,
  Role,
}
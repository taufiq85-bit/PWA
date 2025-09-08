// src/lib/supabase.ts - Enhanced version
import {
  createClient,
  SupabaseClient,
  User,
  Session,
} from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Environment variables validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Create typed Supabase client
export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'sistem-praktikum-pwa',
      },
    },
  }
)

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

// ✅ NEW: Enhanced connection test with RBAC validation
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔗 Testing Supabase connection...')
    
    // Test 1: Check if Supabase is reachable
    const { error: connectionError } = await supabase
      .from('users_profile')
      .select('count')
      .limit(1)

    if (connectionError && connectionError.code !== 'PGRST205') {
      // PGRST205 = table not found (expected before schema creation)
      console.error('❌ Supabase connection failed:', connectionError)
      return false
    }

    console.log('✅ Supabase connection successful')

    // Test 2: Check auth functionality
    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log('✅ Auth system accessible; user logged in:', !!user)

    // Test 3: Check RBAC tables existence (new)
    try {
      const { error: rbacError } = await supabase
        .from('roles')
        .select('count')
        .limit(1)
      
      if (!rbacError) {
        console.log('✅ RBAC tables accessible')
      }
    } catch (rbacError) {
      console.log('⚠️ RBAC tables not yet created (expected in development)')
    }

    return true
  } catch (error) {
    console.error('❌ Supabase connection error:', error)
    return false
  }
}

// ✅ NEW: Helper functions for AuthContext
export const getUserProfile = async (userId: string) => {
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
}

export const getUserRoles = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      roles (
        id,
        role_name,
        role_code,
        description,
        is_active,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching user roles:', error)
    return []
  }

  return (data as any[])?.map((ur: any) => ur.roles).filter(Boolean) || []
}

export const getUserPermissions = async (roleIds: string[]) => {
  if (roleIds.length === 0) return []

  const { data, error } = await supabase
    .from('role_permissions')
    .select(`
      permissions (
        id,
        permission_code,
        permission_name,
        module,
        action,
        description,
        created_at,
        updated_at
      )
    `)
    .in('role_id', roleIds)

  if (error) {
    console.error('Error fetching user permissions:', error)
    return []
  }

  return (data as any[])?.map((rp: any) => rp.permissions).filter(Boolean) || []
}

// ✅ NEW: Auth utilities for better integration
export const signInWithEmailPassword = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  })
}

export const signUpWithEmailPassword = async (email: string, password: string) => {
  return await supabase.auth.signUp({
    email,
    password
  })
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const updateUserPassword = async (password: string) => {
  return await supabase.auth.updateUser({ password })
}

// ✅ NEW: Database helpers for type safety
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Export types for TypeScript
export type { Database, User, Session }
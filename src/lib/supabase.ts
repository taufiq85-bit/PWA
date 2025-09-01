// src/lib/supabase.ts
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

// Connection test function
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Test 1: Check if Supabase is reachable
    const { error } = await supabase
      .from('users_profile')
      .select('count')
      .limit(1)

    if (error && error.code !== 'PGRST205') {
      // PGRST205 = table not found (expected before schema creation)
      console.error('❌ Supabase connection failed:', error)
      return false
    }

    console.log('✅ Supabase connection successful')

    // Test 2: Check auth functionality
    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log('✅ Auth system accessible; user logged in:', !!user)

    return true
  } catch (error) {
    console.error('❌ Supabase connection error:', error)
    return false
  }
}

// Export types for TypeScript
export type { Database, User, Session }

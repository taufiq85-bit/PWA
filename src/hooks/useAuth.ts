// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react'
import { supabase, getCurrentUser, getUserProfile, getUserRoles, getUserPermissions } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// Types
interface UserProfile {
  id: string
  email: string
  name: string
  nim?: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface UserRole {
  id: string
  role_name: string
  role_code: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UserPermission {
  id: string
  permission_code: string
  permission_name: string
  module: string
  action: string
  description?: string
  created_at: string
  updated_at: string
}

interface AuthError {
  code: string
  message: string
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  roles: UserRole[]
  permissions: UserPermission[]
  currentRole: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: AuthError | null
}

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResult {
  success: boolean
  error?: AuthError
}

// Initial auth state
const initialAuthState: AuthState = {
  user: null,
  profile: null,
  roles: [],
  permissions: [],
  currentRole: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState)

  // Helper function to update auth state
  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }))
  }, [])

  // Load user data
  const loadUserData = useCallback(async (user: User) => {
    try {
      updateAuthState({ isLoading: true, error: null })

      // Load user profile
      const profile = await getUserProfile(user.id)
      if (!profile) {
        throw new Error('User profile not found')
      }

      // Load user roles
      const roles = await getUserRoles(user.id)
      
      // Load permissions for all roles
      const roleIds = roles.map(role => role.id)
      const permissions = await getUserPermissions(roleIds)

      // Set current role (first active role or first role)
      const currentRole = roles.find(role => role.is_active)?.role_code || roles[0]?.role_code || null

      updateAuthState({
        user,
        profile,
        roles,
        permissions,
        currentRole,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })

    } catch (error) {
      console.error('Error loading user data:', error)
      updateAuthState({
        user,
        profile: null,
        roles: [],
        permissions: [],
        currentRole: null,
        isAuthenticated: true, // User is still authenticated even if profile loading fails
        isLoading: false,
        error: {
          code: 'PROFILE_LOAD_ERROR',
          message: error instanceof Error ? error.message : 'Failed to load user data'
        }
      })
    }
  }, [updateAuthState])

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      updateAuthState({ isLoading: true, error: null })

      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }

      if (session?.user) {
        await loadUserData(session.user)
      } else {
        updateAuthState({
          ...initialAuthState,
          isLoading: false
        })
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      updateAuthState({
        ...initialAuthState,
        isLoading: false,
        error: {
          code: 'INIT_ERROR',
          message: error instanceof Error ? error.message : 'Authentication initialization failed'
        }
      })
    }
  }, [loadUserData, updateAuthState])

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      updateAuthState({ isLoading: true, error: null })

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) {
        updateAuthState({ 
          isLoading: false, 
          error: { code: error.name || 'LOGIN_ERROR', message: error.message } 
        })
        return { success: false, error: { code: error.name || 'LOGIN_ERROR', message: error.message } }
      }

      if (data.user) {
        await loadUserData(data.user)
        return { success: true }
      }

      throw new Error('Login successful but no user data received')
    } catch (error) {
      const authError = {
        code: 'LOGIN_ERROR',
        message: error instanceof Error ? error.message : 'Login failed'
      }
      updateAuthState({ isLoading: false, error: authError })
      return { success: false, error: authError }
    }
  }, [loadUserData, updateAuthState])

  // Logout function
  const logout = useCallback(async () => {
    try {
      updateAuthState({ isLoading: true, error: null })

      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      updateAuthState({
        ...initialAuthState,
        isLoading: false
      })
    } catch (error) {
      console.error('Error during logout:', error)
      updateAuthState({
        ...initialAuthState,
        isLoading: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: error instanceof Error ? error.message : 'Logout failed'
        }
      })
    }
  }, [updateAuthState])

  // Role detection functions
  const isAdmin = useCallback(() => {
    return authState.roles.some(role => role.role_code === 'ADMIN')
  }, [authState.roles])

  const isDosen = useCallback(() => {
    return authState.roles.some(role => role.role_code === 'DOSEN')
  }, [authState.roles])

  const isMahasiswa = useCallback(() => {
    return authState.roles.some(role => role.role_code === 'MAHASISWA')
  }, [authState.roles])

  const isLaboran = useCallback(() => {
    return authState.roles.some(role => role.role_code === 'LABORAN')
  }, [authState.roles])

  // Permission check function
  const hasPermission = useCallback((permissionCode: string): boolean => {
    return authState.permissions.some(permission => permission.permission_code === permissionCode)
  }, [authState.permissions])

  // Switch role function
  const switchRole = useCallback(async (roleCode: string) => {
    const role = authState.roles.find(r => r.role_code === roleCode)
    if (role) {
      updateAuthState({ currentRole: roleCode })
      
      // Optionally, you can reload permissions for the specific role
      // const permissions = await getUserPermissions([role.id])
      // updateAuthState({ permissions })
    }
  }, [authState.roles, updateAuthState])

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserData(session.user)
      } else if (event === 'SIGNED_OUT') {
        updateAuthState({
          ...initialAuthState,
          isLoading: false
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [initializeAuth, loadUserData, updateAuthState])

  return {
    authState,
    login,
    logout,
    isAdmin,
    isDosen,
    isMahasiswa,
    isLaboran,
    hasPermission,
    switchRole,
    refreshAuth: initializeAuth
  }
}

export default useAuth
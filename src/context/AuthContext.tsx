// src/context/AuthContext.tsx - Fixed version
import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { 
  AuthContextType, 
  AuthState, 
  LoginCredentials, 
  UserRegistrationInput,
  ChangePasswordData,
  AuthError 
} from '@/types/auth'
import type { UserProfile, Role, Permission } from '@/types/user'
import type { User, Session } from '@supabase/supabase-js'

// Auth actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User | null; session: Session | null } }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_ROLES'; payload: Role[] }
  | { type: 'SET_PERMISSIONS'; payload: Permission[] }
  | { type: 'SET_CURRENT_ROLE'; payload: string | null }
  | { type: 'SET_ERROR'; payload: AuthError | null }
  | { type: 'RESET_AUTH' }

// Initial state
const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  roles: [],
  permissions: [],
  currentRole: null,
  isLoading: true,
  isAuthenticated: false,
  error: null
}

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        isAuthenticated: !!action.payload.user,
        error: null
      }
    
    case 'SET_PROFILE':
      return { ...state, profile: action.payload }
    
    case 'SET_ROLES':
      return { ...state, roles: action.payload }
    
    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload }
    
    case 'SET_CURRENT_ROLE':
      return { ...state, currentRole: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    
    case 'RESET_AUTH':
      return { ...initialState, isLoading: false }
    
    default:
      return state
  }
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// AuthProvider props interface
interface AuthProviderProps {
  readonly children: React.ReactNode
}

// AuthProvider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, dispatch] = useReducer(authReducer, initialState)

  // ✅ Fetch user profile and roles
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      // Get user profile - Fix: Add explicit typing
      const { data: profile, error: profileError } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', userId)
        .single() as { data: any; error: any }

      if (profileError) throw profileError

      dispatch({ type: 'SET_PROFILE', payload: profile })

      // Get user roles with proper typing
      const { data: userRoles, error: rolesError } = await supabase
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

      if (rolesError) throw rolesError

      // ✅ Fix type casting for roles
      const roles = (userRoles as Array<{ roles: Role | null }> || [])
        .map(ur => ur.roles)
        .filter((role): role is Role => role !== null)

      dispatch({ type: 'SET_ROLES', payload: roles })

      // Set default current role - Fix: Access role_default safely
      const defaultRole = profile?.role_default || roles[0]?.role_code || null
      dispatch({ type: 'SET_CURRENT_ROLE', payload: defaultRole })

      // Get permissions for current roles
      if (roles.length > 0) {
        await fetchUserPermissions(roles.map(r => r.id))
      }

    } catch (error) {
      console.error('Error fetching user profile:', error)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          code: 'FETCH_PROFILE_ERROR', 
          message: 'Failed to fetch user profile' 
        } 
      })
    }
  }, [])

  // ✅ Fetch user permissions
  const fetchUserPermissions = useCallback(async (roleIds: string[]) => {
    try {
      const { data: rolePermissions, error } = await supabase
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

      if (error) throw error

      // ✅ Fix type casting for permissions
      const permissions = (rolePermissions as Array<{ permissions: Permission | null }> || [])
        .map(rp => rp.permissions)
        .filter((permission): permission is Permission => permission !== null)

      dispatch({ type: 'SET_PERMISSIONS', payload: permissions })

    } catch (error) {
      console.error('Error fetching permissions:', error)
    }
  }, [])

  // ✅ Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: { 
            code: error.message, 
            message: 'Login failed. Please check your credentials.' 
          } 
        })
        return { success: false, error: { code: error.message, message: error.message } }
      }

      if (data.user) {
        dispatch({ type: 'SET_USER', payload: { user: data.user, session: data.session } })
        await fetchUserProfile(data.user.id)
      }

      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: true }

    } catch (error: any) {
      const authError = { 
        code: 'LOGIN_ERROR', 
        message: error.message || 'An unexpected error occurred' 
      }
      dispatch({ type: 'SET_ERROR', payload: authError })
      return { success: false, error: authError }
    }
  }, [fetchUserProfile])

  // ✅ Register function with proper types
  const register = useCallback(async (data: UserRegistrationInput) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password
      })

      if (authError) throw authError

      if (authData.user) {
        // ✅ Create user profile with proper typing
        const { error: profileError } = await supabase
          .from('users_profile')
          .insert({
            id: authData.user.id,
            email: data.email,
            name: data.name,
            nim: data.nim || null,
            phone: data.phone || null,
            role_default: data.role || 'MAHASISWA'
          } as any)

        if (profileError) throw profileError

        // ✅ Assign default role with proper error handling - Fix: Add explicit typing
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('role_code', data.role || 'MAHASISWA')
          .single() as { data: any; error: any }

        if (roleError) {
          console.error('Role fetch error:', roleError)
        } else if (roleData) {
          const { error: userRoleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role_id: roleData.id,
              is_active: true
            } as any)

          if (userRoleError) {
            console.error('User role assignment error:', userRoleError)
          }
        }
      }

      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: true }

    } catch (error: any) {
      const authError = { 
        code: 'REGISTER_ERROR', 
        message: error.message || 'Registration failed' 
      }
      dispatch({ type: 'SET_ERROR', payload: authError })
      return { success: false, error: authError }
    }
  }, [])

  // ✅ Logout function
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      dispatch({ type: 'RESET_AUTH' })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])

  // ✅ Change password function
  const changePassword = useCallback(async (data: ChangePasswordData) => {
    try {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error('New passwords do not match')
      }

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: { code: 'PASSWORD_CHANGE_ERROR', message: error.message } 
      }
    }
  }, [])

  // ✅ Switch role function
  const switchRole = useCallback(async (roleCode: string) => {
    const hasRole = authState.roles.some(role => role.role_code === roleCode)
    if (hasRole) {
      dispatch({ type: 'SET_CURRENT_ROLE', payload: roleCode })
      
      // Update permissions for new role
      const selectedRole = authState.roles.find(r => r.role_code === roleCode)
      if (selectedRole) {
        await fetchUserPermissions([selectedRole.id])
      }
    }
  }, [authState.roles, fetchUserPermissions])

  // ✅ Refresh user data
  const refreshUserData = useCallback(async () => {
    if (authState.user) {
      await fetchUserProfile(authState.user.id)
    }
  }, [authState.user, fetchUserProfile])

  // ✅ Permission check functions
  const hasPermission = useCallback((permission: string) => {
    return authState.permissions.some(p => p.permission_code === permission)
  }, [authState.permissions])

  const hasRole = useCallback((role: string) => {
    return authState.roles.some(r => r.role_code === role)
  }, [authState.roles])

  const canAccess = useCallback((resource: string, action: string) => {
    return authState.permissions.some(p => 
      p.module === resource && p.action === action
    )
  }, [authState.permissions])

  // ✅ Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          dispatch({ 
            type: 'SET_USER', 
            payload: { user: session.user, session } 
          })
          await fetchUserProfile(session.user.id)
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          dispatch({ 
            type: 'SET_USER', 
            payload: { user: session.user, session } 
          })
          await fetchUserProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'RESET_AUTH' })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchUserProfile])

  // ✅ Memoize context value to prevent unnecessary re-renders
  const contextValue: AuthContextType = useMemo(() => ({
    authState,
    login,
    logout,
    register,
    changePassword,
    switchRole,
    refreshUserData,
    hasPermission,
    hasRole,
    canAccess
  }), [
    authState,
    login,
    logout,
    register,
    changePassword,
    switchRole,
    refreshUserData,
    hasPermission,
    hasRole,
    canAccess
  ])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// useAuth hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
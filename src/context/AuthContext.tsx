import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { supabase, supabaseHelpers } from '../lib/supabase'
import type {
  AuthContextType,
  AuthState,
  AuthError,
  AuthResult,
  LoginCredentials,
  RegisterData,
  UserProfile,
  UserRole,
  UserPermission,
  UserProfileUpdate,
  PermissionAction,
} from '../types/auth'
import type { User } from '@supabase/supabase-js'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Actions for reducer
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_ROLES'; payload: UserRole[] }
  | { type: 'SET_PERMISSIONS'; payload: UserPermission[] }
  | { type: 'SET_CURRENT_ROLE'; payload: string | null }
  | { type: 'SET_ERROR'; payload: AuthError }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_SESSION_EXPIRY'; payload: number | null }
  | { type: 'SET_LAST_ACTIVITY'; payload: number | null }
  | { type: 'SET_DEVICE_INFO'; payload: string | undefined }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_AUTH' }

// Initial state
const initialState: AuthState = {
  user: null,
  profile: null,
  roles: [],
  permissions: [],
  currentRole: null,
  isAuthenticated: false,
  loading: true,
  initialized: false,
  error: null,
  sessionExpiry: null,
  lastActivity: null,
  deviceInfo: undefined,
}

// Reducer function
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
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
      return { ...state, error: action.payload, loading: false }
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload }
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload }
    case 'SET_SESSION_EXPIRY':
      return { ...state, sessionExpiry: action.payload }
    case 'SET_LAST_ACTIVITY':
      return { ...state, lastActivity: action.payload }
    case 'SET_DEVICE_INFO':
      return { ...state, deviceInfo: action.payload }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'RESET_AUTH':
      return { ...initialState, loading: false, initialized: true }
    default:
      return state
  }
}

// Helper function to get device info
const getDeviceInfo = (): string => {
  const userAgent = navigator.userAgent
  const platform = navigator.platform
  return `${platform} - ${userAgent.substring(0, 100)}`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth
  useEffect(() => {
    initializeAuth()
  }, [])

  // Listen to auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)

      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserData(session.user)
        // Set session expiry
        if (session.expires_at) {
          dispatch({
            type: 'SET_SESSION_EXPIRY',
            payload: session.expires_at * 1000,
          })
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'RESET_AUTH' })
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        await loadUserData(session.user)
      } else if (event === 'USER_UPDATED' && session?.user) {
        // Handle email verification completion
        if (session.user.email_confirmed_at) {
          console.log('Email verified successfully')
          await loadUserData(session.user)
        }
      } else if (event === 'PASSWORD_RECOVERY' && session?.user) {
        // Handle password recovery flow
        console.log('Password recovery initiated')
        await loadUserData(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Update last activity periodically
  useEffect(() => {
    const updateActivity = () => {
      if (state.isAuthenticated) {
        dispatch({ type: 'SET_LAST_ACTIVITY', payload: Date.now() })
      }
    }

    // Update activity on various user interactions
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true })
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity)
      })
    }
  }, [state.isAuthenticated])

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_DEVICE_INFO', payload: getDeviceInfo() })

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        await loadUserData(session.user)
        if (session.expires_at) {
          dispatch({
            type: 'SET_SESSION_EXPIRY',
            payload: session.expires_at * 1000,
          })
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null })
      }
    } catch (error) {
      console.error('Initialize auth error:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Gagal memuat data pengguna' })
    } finally {
      dispatch({ type: 'SET_INITIALIZED', payload: true })
    }
  }

  const loadUserData = async (user: User) => {
    try {
      dispatch({ type: 'SET_USER', payload: user })
      dispatch({ type: 'SET_LAST_ACTIVITY', payload: Date.now() })

      // Load profile with enhanced error handling
      let profile = await supabaseHelpers.getUserProfile(user.id)

      // If profile doesn't exist, try to create it from auth metadata
      if (!profile && user.email) {
        try {
          console.log('Creating missing profile for user:', user.id)
          profile = await supabaseHelpers.createUserProfile({
            id: user.id,
            email: user.email,
            full_name:
              user.user_metadata?.full_name || user.email.split('@')[0],
            username: user.user_metadata?.username,
            nim_nip:
              user.user_metadata?.nim_nip ||
              user.user_metadata?.nim ||
              user.user_metadata?.nip,
            phone: user.user_metadata?.phone,
            role_default: user.user_metadata?.role || 'MAHASISWA',
          })
        } catch (createError) {
          console.warn('Failed to create profile automatically:', createError)
          // Create a temporary profile from auth data for UI consistency
          profile = {
            id: user.id,
            email: user.email,
            full_name:
              user.user_metadata?.full_name || user.email.split('@')[0],
            username: user.user_metadata?.username || '',
            nim_nip:
              user.user_metadata?.nim_nip ||
              user.user_metadata?.nim ||
              user.user_metadata?.nip ||
              '',
            phone: user.user_metadata?.phone || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            role_default: user.user_metadata?.role || 'MAHASISWA',
            is_active: true,
            email_verified: user.email_confirmed_at ? true : false,
            created_at: user.created_at,
            updated_at: new Date().toISOString(),
          }
        }
      }

      if (profile) {
        dispatch({ type: 'SET_PROFILE', payload: profile })
      }

      // Load roles
      const roles = await supabaseHelpers.getUserRoles(user.id)
      dispatch({ type: 'SET_ROLES', payload: roles })

      // Load permissions
      const permissionsData = await supabaseHelpers.getUserPermissions(user.id)
      const permissions: UserPermission[] = permissionsData.map(
        (perm: any) => ({
          id: perm.id,
          permission_code: perm.permission_code,
          permission_name: perm.permission_name,
          module: perm.module,
          action: perm.action,
          description: perm.description,
          created_at: perm.created_at || new Date().toISOString(),
          updated_at: perm.updated_at,
        })
      )
      dispatch({ type: 'SET_PERMISSIONS', payload: permissions })

      // Set current role
      const currentRole =
        roles.find((role) => role.is_active)?.role_code ||
        roles[0]?.role_code ||
        profile?.role_default ||
        null
      dispatch({ type: 'SET_CURRENT_ROLE', payload: currentRole })
    } catch (error) {
      console.error('Load user data error:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Gagal memuat data pengguna' })
    }
  }

  // Auth actions
  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
        return { success: false, error: error.message }
      }

      if (data.user) {
        await loadUserData(data.user)
        await trackLogin(getDeviceInfo())
      }

      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Terjadi kesalahan saat login'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  // Enhanced register function with automatic profile creation
  const register = async (data: RegisterData): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      // Prepare auth metadata
      const authMetadata: Record<string, any> = {
        full_name: data.full_name,
      }

      if (data.phone) authMetadata.phone = data.phone
      if (data.nim_nip) authMetadata.nim_nip = data.nim_nip
if (data.role_code) authMetadata.role = data.role_code
      if (data.username) authMetadata.username = data.username

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: authMetadata,
        },
      })

      if (authError) {
        dispatch({ type: 'SET_ERROR', payload: authError.message })
        return { success: false, error: authError.message }
      }

      if (!authData.user) {
        dispatch({ type: 'SET_ERROR', payload: 'Gagal membuat user' })
        return { success: false, error: 'Gagal membuat user' }
      }

      // Auto-create profile after auth user created
      try {
        await supabaseHelpers.createUserProfile({
          id: authData.user.id,
          email: authData.user.email!,
          full_name: data.full_name,
          username: data.username,
          phone: data.phone,
          nim_nip: data.nim_nip,
role_default: data.role_code || 'MAHASISWA',
        })

        console.log('✅ Profile created successfully during registration')
      } catch (profileError) {
        console.warn(
          '⚠️ Profile creation failed during registration, will retry on login:',
          profileError
        )
        // Don't fail registration if profile creation fails
        // The profile will be created automatically on first login
      }

      return {
        success: true,
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Terjadi kesalahan saat registrasi'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await supabase.auth.signOut()
      dispatch({ type: 'RESET_AUTH' })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Enhanced resetPassword method with better error handling
  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
        return { success: false, error: error.message }
      }

      return {
        success: true,
        data: { message: 'Link reset password telah dikirim ke email Anda' },
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Gagal mengirim email reset password'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return { success: false, error: errorMessage }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updatePassword = async (newPassword: string): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
        return { success: false, error: error.message }
      }

      return {
        success: true,
        data: { message: 'Password berhasil diubah' },
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Gagal mengubah password'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return { success: false, error: errorMessage }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updateProfile = async (
    updates: UserProfileUpdate
  ): Promise<AuthResult> => {
    try {
      if (!state.user) {
        return { success: false, error: 'User tidak ditemukan' }
      }

      const updatedProfile = await supabaseHelpers.updateUserProfile(
        state.user.id,
        updates
      )
      if (updatedProfile) {
        dispatch({ type: 'SET_PROFILE', payload: updatedProfile })
      }

      // Reload user data to ensure consistency
      await loadUserData(state.user)

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal update profile' }
    }
  }

  const uploadAvatar = async (file: File): Promise<AuthResult> => {
    try {
      if (!state.user) {
        return { success: false, error: 'User tidak ditemukan' }
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${state.user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        return { success: false, error: uploadError.message }
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

      await updateProfile({ avatar_url: data.publicUrl })

      return { success: true, data: { avatar_url: data.publicUrl } }
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal upload avatar' }
    }
  }

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error

      if (data.user && data.session?.expires_at) {
        await loadUserData(data.user)
        dispatch({
          type: 'SET_SESSION_EXPIRY',
          payload: data.session.expires_at * 1000,
        })
      }
    } catch (error) {
      console.error('Refresh session error:', error)
    }
  }

  const extendSession = async (): Promise<void> => {
    try {
      await refreshSession()
      updateLastActivity()
    } catch (error) {
      console.error('Extend session error:', error)
    }
  }

  const switchRole = (roleCode: string) => {
    const role = state.roles.find((r) => r.role_code === roleCode)
    if (role) {
      dispatch({ type: 'SET_CURRENT_ROLE', payload: roleCode })
    }
  }

  // Permission helpers
  const hasPermission = (permission: string, module?: string): boolean => {
    return state.permissions.some((perm) => {
      const hasPermCode = perm.permission_code === permission
      const hasModule = module ? perm.module === module : true
      return hasPermCode && hasModule
    })
  }

  const hasRole = (roleCode: string): boolean => {
    return state.roles.some(
      (role) => role.role_code === roleCode && role.is_active
    )
  }

  const canAccess = (resource: string, action: PermissionAction): boolean => {
    return state.permissions.some(
      (perm) =>
        perm.module.toLowerCase() === resource.toLowerCase() &&
        perm.action === action
    )
  }

  // Activity tracking
  const updateLastActivity = (): void => {
    dispatch({ type: 'SET_LAST_ACTIVITY', payload: Date.now() })
  }

  const trackLogin = async (deviceInfo?: string): Promise<void> => {
    try {
      if (deviceInfo) {
        dispatch({ type: 'SET_DEVICE_INFO', payload: deviceInfo })
      }

      // Update last login in profile
      if (state.user) {
        await updateProfile({
          last_login: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('Track login error:', error)
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Enhanced profile fetching with automatic creation fallback
  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      let profile = await supabaseHelpers.getUserProfile(userId)

      // If profile doesn't exist and we have a current user, try to create it
      if (
        !profile &&
        state.user &&
        state.user.id === userId &&
        state.user.email
      ) {
        try {
          profile = await supabaseHelpers.createUserProfile({
            id: userId,
            email: state.user.email,
            full_name:
              state.user.user_metadata?.full_name ||
              state.user.email.split('@')[0],
            username: state.user.user_metadata?.username,
            nim_nip:
              state.user.user_metadata?.nim_nip ||
              state.user.user_metadata?.nim ||
              state.user.user_metadata?.nip,
            phone: state.user.user_metadata?.phone,
            role_default: state.user.user_metadata?.role || 'MAHASISWA',
          })
        } catch (createError) {
          console.warn('Failed to create profile in fetchProfile:', createError)
        }
      }

      if (profile) {
        dispatch({ type: 'SET_PROFILE', payload: profile })
      }
    } catch (error: any) {
      console.error('Fetch profile error:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Gagal memuat profile',
      })
    }
  }

  const checkSession = async (): Promise<boolean> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
        return false
      }

      if (!session) {
        dispatch({ type: 'RESET_AUTH' })
        return false
      }

      // Check if session is expired
      if (session.expires_at && session.expires_at * 1000 < Date.now()) {
        dispatch({ type: 'RESET_AUTH' })
        return false
      }

      // Update session expiry
      if (session.expires_at) {
        dispatch({
          type: 'SET_SESSION_EXPIRY',
          payload: session.expires_at * 1000,
        })
      }

      // Optionally refresh user data if session is valid
      if (session.user && session.user.id !== state.user?.id) {
        await loadUserData(session.user)
      }

      return true
    } catch (error: any) {
      console.error('Check session error:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Gagal memeriksa session',
      })
      return false
    }
  }

  const fetchUserRoles = async (userId: string): Promise<void> => {
    try {
      const roles = await supabaseHelpers.getUserRoles(userId)
      dispatch({ type: 'SET_ROLES', payload: roles })

      // Update current role if needed
      const currentRole =
        roles.find((role) => role.is_active)?.role_code ||
        roles[0]?.role_code ||
        null
      dispatch({ type: 'SET_CURRENT_ROLE', payload: currentRole })
    } catch (error: any) {
      console.error('Fetch user roles error:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Gagal memuat roles',
      })
    }
  }

  const fetchUserPermissions = async (_roleIds: string[]): Promise<void> => {
    try {
      // If no user is authenticated, return early
      if (!state.user) {
        return
      }

      // Use the existing getUserPermissions method
      const permissionsData = await supabaseHelpers.getUserPermissions(
        state.user.id
      )

      const permissions: UserPermission[] = permissionsData.map(
        (perm: any) => ({
          id: perm.id,
          permission_code: perm.permission_code,
          permission_name: perm.permission_name,
          module: perm.module,
          action: perm.action,
          description: perm.description,
          created_at: perm.created_at || new Date().toISOString(),
          updated_at: perm.updated_at,
        })
      )

      dispatch({ type: 'SET_PERMISSIONS', payload: permissions })
    } catch (error: any) {
      console.error('Fetch user permissions error:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Gagal memuat permissions',
      })
    }
  }

  // Context value
  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar,
    refreshSession,
    extendSession,
    switchRole,
    hasPermission,
    hasRole,
    canAccess,
    updateLastActivity,
    trackLogin,
    clearError,
    fetchProfile,
    checkSession,
    fetchUserRoles,
    fetchUserPermissions,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

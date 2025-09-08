// src/types/auth.ts
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile, Role, Permission } from './user'

// ✅ Fix RegisterForm error - Add missing UserRegistrationInput
export interface UserRegistrationInput {
  email: string
  password: string
  confirmPassword: string
  name: string
  nim?: string
  phone?: string
  role?: string
}

// Authentication state
export interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  roles: Role[]
  permissions: Permission[]
  currentRole: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: AuthError | null
}

// Login credentials
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

// Password management
export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Authentication errors
export interface AuthError {
  code: string
  message: string
  details?: any
}

// Authentication context type
export interface AuthContextType {
  // State
  authState: AuthState
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: AuthError }>
  logout: () => Promise<void>
  register: (data: UserRegistrationInput) => Promise<{ success: boolean; error?: AuthError }>
  changePassword: (data: ChangePasswordData) => Promise<{ success: boolean; error?: AuthError }>
  
  // Role management
  switchRole: (roleId: string) => Promise<void>
  refreshUserData: () => Promise<void>
  
  // Permission checks
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  canAccess: (resource: string, action: string) => boolean
}

// Auth hook return type
export interface UseAuthReturn extends AuthContextType {
  isAdmin: boolean
  isDosen: boolean
  isMahasiswa: boolean
  isLaboran: boolean
}

// Auth flow states
export type AuthFlowState = 
  | 'idle'
  | 'loading' 
  | 'authenticating'
  | 'authenticated'
  | 'error'
  | 'passwordReset'
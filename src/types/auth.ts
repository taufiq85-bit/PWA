// src/types/auth.ts
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile, Role, Permission } from './user'

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
}

// Login credentials
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

// Registration data
export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  name: string
  nim?: string
  phone?: string
  role?: string
}

// Password reset
export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetData {
  token: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Authentication errors
export interface AuthError {
  code: string
  message: string
  details?: unknown
}

// Session management
export interface SessionData {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: User
  profile: UserProfile
  roles: Role[]
  currentRole: string
}

// Authentication context
export interface AuthContextType {
  // State
  authState: AuthState

  // Actions
  login: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; error?: AuthError }>
  logout: () => Promise<void>
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; error?: AuthError }>
  requestPasswordReset: (
    email: string
  ) => Promise<{ success: boolean; error?: AuthError }>
  resetPassword: (
    data: PasswordResetData
  ) => Promise<{ success: boolean; error?: AuthError }>
  changePassword: (
    data: ChangePasswordData
  ) => Promise<{ success: boolean; error?: AuthError }>

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

// Login form validation
export interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  nim: string
  phone: string
  role: string
}

// Auth flow states
export type AuthFlowState =
  | 'idle'
  | 'loading'
  | 'authenticating'
  | 'authenticated'
  | 'error'
  | 'passwordReset'
  | 'emailConfirmation'

// OAuth provider types
export type OAuthProvider = 'google' | 'github' | 'microsoft'

export interface OAuthCredentials {
  provider: OAuthProvider
  redirectTo?: string
}

// Multi-factor authentication (future)
export interface MFASetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface MFAVerification {
  token: string
  backupCode?: string
}

// Account verification
export interface EmailVerification {
  token: string
  email: string
}

// Security events
export type SecurityEventType =
  | 'login'
  | 'logout'
  | 'password_change'
  | 'failed_login'
  | 'role_switch'
  | 'permission_denied'

export interface SecurityEvent {
  id: string
  userId: string
  eventType: SecurityEventType
  ipAddress: string
  userAgent: string
  timestamp: string
  details?: Record<string, unknown>
}

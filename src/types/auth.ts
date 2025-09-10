import type { User } from '@supabase/supabase-js'

// Database types - Fixed and consistent
export interface UserProfile {
  id: string
  email: string
  name?: string
  nim_nip?: string
  full_name: string // FIXED: Changed from ReactNode | string to string only
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Role type with proper structure
export interface UserRole {
  id: string
  role_name: string
  role_code: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at?: string // Made optional to match database schema
}

// Permission type with all required fields
export interface UserPermission {
  id: string
  permission_code: string
  permission_name: string
  module: string
  action: string
  description?: string
  created_at: string
  updated_at?: string // Made optional to match database schema
}

// Role-Permission junction type for database queries
export interface RolePermission {
  id: string
  role_id: string
  permission_id: string
  created_at: string
  updated_at?: string // Made optional to match database schema
  permissions: UserPermission
}

// User-Role junction type for database queries
export interface UserRoleAssignment {
  id: string
  user_id: string
  role_id: string
  is_active: boolean
  assigned_at: string
  assigned_by?: string // Who assigned this role
  expires_at?: string // Role expiration date
  roles: UserRole
}

// Update types for Supabase operations
export interface UserProfileUpdate {
  full_name?: string
  phone?: string
  avatar_url?: string
  nim_nip?: string
  name?: string
  is_active?: boolean // Add user status
  last_login?: string // Track last login
  department?: string // User department/faculty
}

// Simple error type
export type AuthError = string | null

// Auth credentials
export interface LoginCredentials {
  email: string
  password: string
  remember_me?: boolean
}

// FIXED: Updated RegisterData to match your database schema
export interface RegisterData {
  username?: string
  email: string
  password: string
  confirmPassword: string // Added for password confirmation
  fullName: string // Changed from username to fullName
  phone?: string
  role?: 'ADMIN' | 'DOSEN' | 'MAHASISWA' | 'LABORAN' // Updated to match role codes
  nim?: string // Changed from nim_nip to nim for students
  nip?: string // Added NIP for staff/faculty
  laboratory_id?: string
  department?: string // User department
  academic_year?: string // Academic year for students
  batch?: string // Student batch/angkatan
}

// User registration input type (for forms)
export interface UserRegistrationInput {
  name: any
  email: string
  password: string
  confirmPassword: string
  fullName: string
  phone?: string
  nim?: string
  nip?: string
  role?: string
}

// Core auth state - SIMPLIFIED and FIXED
export interface AuthState {
  user: User | null
  profile: UserProfile | null
  roles: UserRole[]
  permissions: UserPermission[]
  currentRole: string | null
  isAuthenticated: boolean
  loading: boolean
  initialized: boolean
  error: AuthError
  sessionExpiry: number | null // Track session expiration
  lastActivity: number | null // Track user activity
  deviceInfo?: string // Track device/browser info
}

// Auth operations return type
export interface AuthResult {
  success: boolean
  error?: string
  data?: any // Optional data field for successful operations
}

// Password reset types
export interface PasswordResetRequest {
  email: string
}

export interface PasswordUpdateRequest {
  newPassword: string
  confirmPassword: string
}

// Session management types
export interface SessionInfo {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// Auth actions interface - FIXED with better typing
export interface AuthActions {
  // Authentication
  login: (credentials: LoginCredentials) => Promise<AuthResult>
  register: (data: RegisterData) => Promise<AuthResult>
  logout: () => Promise<void>
  
  // Password management
  resetPassword: (email: string) => Promise<AuthResult>
updatePassword: (newPassword: string) => Promise<AuthResult>
  
  // Profile management
  updateProfile: (data: UserProfileUpdate) => Promise<AuthResult>
  fetchProfile: (userId: string) => Promise<void>
  uploadAvatar: (file: File) => Promise<AuthResult> // Avatar upload
  
  // Session management
  refreshSession: () => Promise<void>
  checkSession: () => Promise<boolean>
  extendSession: () => Promise<void> // Extend session
  
  // Role management
  switchRole: (roleCode: string) => void
  fetchUserRoles: (userId: string) => Promise<void>
  fetchUserPermissions: (roleIds: string[]) => Promise<void>
  
  // Permission helpers
  hasPermission: (permission: string, module?: string) => boolean
  hasRole: (roleCode: string) => boolean
  canAccess: (resource: string, action: PermissionAction) => boolean
  
  // Activity tracking
  updateLastActivity: () => void
  trackLogin: (deviceInfo?: string) => Promise<void>
  
  // Error handling
  clearError: () => void
}

// Complete context type
export type AuthContextType = AuthState & AuthActions

// Additional utility types
export type RoleCode = 'ADMIN' | 'DOSEN' | 'MAHASISWA' | 'LABORAN'
export type PermissionAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE' | 'EXPORT' | 'IMPORT'
export type PermissionModule = 'USER' | 'ROLE' | 'LABORATORY' | 'EQUIPMENT' | 'RESERVATION' | 'REPORT' | 'DASHBOARD' | 'SETTINGS'

// New utility types
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error'
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending'
export type SessionStatus = 'active' | 'expired' | 'refreshing'

// Database table types for Supabase
export interface Database {
  public: {
    Tables: {
      users_profile: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
      }
      roles: {
        Row: UserRole
        Insert: Omit<UserRole, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserRole, 'id' | 'created_at' | 'updated_at'>>
      }
      permissions: {
        Row: UserPermission
        Insert: Omit<UserPermission, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserPermission, 'id' | 'created_at' | 'updated_at'>>
      }
      user_roles: {
        Row: UserRoleAssignment
        Insert: Omit<UserRoleAssignment, 'id' | 'assigned_at'>
        Update: Partial<Omit<UserRoleAssignment, 'id' | 'user_id' | 'role_id' | 'assigned_at'>>
      }
      role_permissions: {
        Row: RolePermission
        Insert: Omit<RolePermission, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<RolePermission, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}

// Type helpers for form validation
export interface FormErrors {
  [key: string]: string | undefined
}

export interface ValidationResult {
  isValid: boolean
  errors: FormErrors
}

// Export commonly used type guards
export const isUserProfile = (obj: any): obj is UserProfile => {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string'
}

export const isUserRole = (obj: any): obj is UserRole => {
  return obj && typeof obj.id === 'string' && typeof obj.role_code === 'string'
}

export const isUserPermission = (obj: any): obj is UserPermission => {
  return obj && typeof obj.id === 'string' && typeof obj.permission_code === 'string'
}

// Additional helper functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export const isValidNIM = (nim: string): boolean => {
  // Assuming NIM format: 8-10 digits
  const nimRegex = /^\d{8,10}$/
  return nimRegex.test(nim)
}

export const isValidNIP = (nip: string): boolean => {
  // Assuming NIP format: 18 digits
  const nipRegex = /^\d{18}$/
  return nipRegex.test(nip)
}
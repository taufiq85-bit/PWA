// src/types/index.ts
// Authentication types
export * from './auth'

// User and profile types
export * from './user'

// Role and permission types (aliased to avoid conflicts)
export type {
  Role as RoleFromRoleModule,
  Permission as PermissionFromRoleModule,
} from './role'

// Common utility types
export * from './common'

// Database types (existing)
export * from './database'

// Re-export Supabase types for convenience
export type { User, Session } from '@supabase/supabase-js'

// src/lib/database.ts
import { supabase, testSupabaseConnection } from './supabase'
import type { Database } from '@/types/database'

// Type aliases for convenience
type Tables = Database['public']['Tables']
type UserProfile = Tables['users_profile']['Row']
type Role = Tables['roles']['Row']
type Permission = Tables['permissions']['Row']

// Generic database operations
export class DatabaseService {
  // Generic select with error handling
  static async select<T>(
    table: string,
    columns: string = '*',
    conditions?: Record<string, any>
  ): Promise<{ data: T[] | null; error: any }> {
    try {
      let query = supabase.from(table).select(columns)

      if (conditions) {
        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { data, error } = await query
      return { data: data as T[], error }
    } catch (error) {
      console.error(`Database select error on ${table}:`, error)
      return { data: null, error }
    }
  }

  // Generic insert with error handling
  static async insert<T>(
    table: string,
    data: any
  ): Promise<{ data: T | null; error: any }> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()

      return { data: result as T, error }
    } catch (error) {
      console.error(`Database insert error on ${table}:`, error)
      return { data: null, error }
    }
  }

  // Generic update with error handling
  static async update<T>(
    table: string,
    id: string,
    updates: any
  ): Promise<{ data: T | null; error: any }> {
    try {
      const { data, error } = await (supabase.from(table) as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      return { data: data as T, error }
    } catch (error) {
      console.error(`Database update error on ${table}:`, error)
      return { data: null, error }
    }
  }

  // Generic delete with soft delete support
  static async delete(
    table: string,
    id: string,
    softDelete: boolean = true
  ): Promise<{ success: boolean; error: any }> {
    try {
      if (softDelete) {
        const { error } = await (supabase.from(table) as any)
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', id)

        return { success: !error, error }
      } else {
        const { error } = await (supabase.from(table) as any)
          .delete()
          .eq('id', id)

        return { success: !error, error }
      }
    } catch (error) {
      console.error(`Database delete error on ${table}:`, error)
      return { success: false, error }
    }
  }

  // Check if table exists (for schema validation)
  static async tableExists(tableName: string): Promise<boolean> {
    try {
      const { error } = await supabase.from(tableName).select('*').limit(0)

      // Table exists if no error or if error is not "relation does not exist"
      return !error || !error.message.includes('does not exist')
    } catch {
      return false
    }
  }

  // Get table row count
  static async getRowCount(tableName: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      if (error) return 0
      return data?.length || 0
    } catch {
      return 0
    }
  }
}

// Specialized user operations
export class UserService {
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await DatabaseService.select<UserProfile>(
      'users_profile',
      '*',
      { id: userId }
    )

    if (error || !data?.[0]) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data[0]
  }

  static async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(
          `
          roles:role_id (
            id,
            name,
            description,
            is_active
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
        (data as { roles: Role | null }[] | null)
          ?.map((item) => item.roles)
          .filter((role): role is Role => !!role) || []
      )
    } catch (error) {
      console.error('Error in getUserRoles:', error)
      return []
    }
  }

  static async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(
          `
          roles:role_id (
            role_permissions (
              permissions:permission_id (
                id,
                name,
                resource,
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
        console.error('Error fetching user permissions:', error)
        return []
      }

      // Flatten permissions from all roles
      type UserRoleWithPermissions = {
        roles?: {
          role_permissions?: {
            permissions?: Permission
          }[]
        }
      }
      const permissions: Permission[] = []
      ;(data as UserRoleWithPermissions[] | null)?.forEach((userRole) => {
        userRole.roles?.role_permissions?.forEach((rp) => {
          if (rp.permissions) {
            permissions.push(rp.permissions)
          }
        })
      })

      // Remove duplicates based on permission ID
      return permissions.filter(
        (permission, index, array) =>
          array.findIndex((p) => p.id === permission.id) === index
      )
    } catch (error) {
      console.error('Error in getUserPermissions:', error)
      return []
    }
  }
}

// Database health check
export const checkDatabaseHealth = async () => {
  console.log('🔍 Checking database health...')

  // Core tables that should exist
  const coreTables = [
    'users_profile',
    'roles',
    'permissions',
    'user_roles',
    'role_permissions',
  ]

  const results = {
    connection: false,
    tablesExist: {} as Record<string, boolean>,
    rowCounts: {} as Record<string, number>,
  }

  // Test connection
  results.connection = await testSupabaseConnection()

  // Check if tables exist
  for (const table of coreTables) {
    results.tablesExist[table] = await DatabaseService.tableExists(table)
    if (results.tablesExist[table]) {
      results.rowCounts[table] = await DatabaseService.getRowCount(table)
    }
  }

  console.log('📊 Database Health Results:', results)
  return results
}

// Export everything
export { testSupabaseConnection } from './supabase'

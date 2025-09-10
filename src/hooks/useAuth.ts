import { useAuthContext } from '@/context/AuthContext'

export const useAuth = () => {
  const context = useAuthContext()

  // Role checkers
  const hasRole = (roleName: string): boolean => {
    return context.roles.some(
      (role) => role.role_name === roleName || role.role_code === roleName
    )
  }

  const hasPermission = (permissionCode: string): boolean => {
    return context.permissions.some(
      (permission) => permission.permission_code === permissionCode
    )
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((permission) => hasPermission(permission))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every((permission) => hasPermission(permission))
  }

  // Specific role checkers
  const isAdmin = (): boolean => hasRole('ADMIN') || hasRole('admin')
  const isDosen = (): boolean => hasRole('DOSEN') || hasRole('dosen')
  const isMahasiswa = (): boolean =>
    hasRole('MAHASISWA') || hasRole('mahasiswa')
  const isLaboran = (): boolean => hasRole('LABORAN') || hasRole('laboran')

  // Status checkers
  const isAuthenticated = (): boolean =>
    context.isAuthenticated && context.initialized
  const isLoading = (): boolean => context.loading || !context.initialized
  const hasError = (): boolean => !!context.error

  // Error helpers
  const getErrorMessage = (): string => {
    if (!context.error) return ''

    const errorTranslations: Record<string, string> = {
      'Invalid login credentials': 'Email atau password salah',
      'Email not confirmed': 'Email belum dikonfirmasi',
      'User not found': 'Pengguna tidak ditemukan',
      'Password is too short': 'Password terlalu pendek',
      'Email already registered': 'Email sudah terdaftar',
    }

    return errorTranslations[context.error] || context.error
  }

  return {
    // Direct state access
    user: context.user,
    profile: context.profile,
    roles: context.roles,
    permissions: context.permissions,
    currentRole: context.currentRole,
    loading: context.loading,
    initialized: context.initialized,
    error: context.error,
    isAuthenticated: isAuthenticated,

    // Role & Permission checks
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isDosen,
    isMahasiswa,
    isLaboran,

    // Status checks
    isLoading: isLoading,
    hasError: hasError,

    // Auth operations - direct pass-through
    login: context.login,
    register: context.register,
    logout: context.logout,
    resetPassword: context.resetPassword,
    updatePassword: context.updatePassword,
    updateProfile: context.updateProfile,
    refreshSession: context.refreshSession,
    switchRole: context.switchRole,
    clearError: context.clearError,

    // Error handling
    getErrorMessage,

    // Legacy support for existing code
    authState: {
      user: context.user,
      profile: context.profile,
      roles: context.roles,
      permissions: context.permissions,
      currentRole: context.currentRole,
      isAuthenticated: context.isAuthenticated,
      isLoading: context.loading,
      error: context.error
        ? { code: 'AUTH_ERROR', message: context.error }
        : null,
    },
    refreshAuth: context.refreshSession,
  }
}

export default useAuth

// Fix for line 130 - Add proper typing for profile
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

// Fix for line 271 - Add proper typing for role data
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
            role_id: roleData.id, // Fix: Now roleData.id is properly typed
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
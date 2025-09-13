import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

interface LoginAttempt {
  id: string
  email: string
  success: boolean
  timestamp: Date
  ipAddress: string
  userAgent: string
  failureReason?: string
}

interface SecurityState {
  failedAttempts: number
  isLocked: boolean
  lockoutUntil: Date | null
  attempts: LoginAttempt[]
  suspiciousActivity: boolean
}

export function useAuth() {
  const authContext = useAuthContext()
  const [securityState, setSecurityState] = useState<SecurityState>({
    failedAttempts: 0,
    isLocked: false,
    lockoutUntil: null,
    attempts: [],
    suspiciousActivity: false
  })

  // Security constants
  const MAX_FAILED_ATTEMPTS = 5
  const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
  const ATTEMPT_WINDOW = 10 * 60 * 1000 // 10 minutes window

  // Get client info for logging
  const getClientInfo = useCallback(() => {
    return {
      ipAddress: 'Unknown', // In real app, get from server
      userAgent: navigator.userAgent,
      timestamp: new Date()
    }
  }, [])

  // Log login attempt
  const logLoginAttempt = useCallback((email: string, success: boolean, failureReason?: string) => {
    const attempt: LoginAttempt = {
      id: `attempt-${Date.now()}-${Math.random()}`,
      email,
      success,
      failureReason,
      ...getClientInfo()
    }

    setSecurityState(prev => ({
      ...prev,
      attempts: [attempt, ...prev.attempts.slice(0, 49)] // Keep last 50 attempts
    }))

    // Store in localStorage for persistence
    const storedAttempts = localStorage.getItem('auth-attempts')
    const attempts = storedAttempts ? JSON.parse(storedAttempts) : []
    attempts.unshift(attempt)
    localStorage.setItem('auth-attempts', JSON.stringify(attempts.slice(0, 50)))

    console.log(`Login attempt logged: ${email} - ${success ? 'SUCCESS' : 'FAILED'}`)
  }, [getClientInfo])

  // Check if account is locked
  const checkAccountLockout = useCallback((email: string) => {
    const now = new Date()
    const storedAttempts = localStorage.getItem('auth-attempts')
    const attempts: LoginAttempt[] = storedAttempts ? JSON.parse(storedAttempts) : []

    // Get failed attempts for this email in the last window
    const recentFailedAttempts = attempts.filter(attempt => 
      attempt.email === email &&
      !attempt.success &&
      (now.getTime() - new Date(attempt.timestamp).getTime()) < ATTEMPT_WINDOW
    )

    const failedCount = recentFailedAttempts.length

    if (failedCount >= MAX_FAILED_ATTEMPTS) {
      const lockoutUntil = new Date(now.getTime() + LOCKOUT_DURATION)
      
      setSecurityState(prev => ({
        ...prev,
        failedAttempts: failedCount,
        isLocked: true,
        lockoutUntil
      }))

      return {
        isLocked: true,
        lockoutUntil,
        failedAttempts: failedCount
      }
    }

    setSecurityState(prev => ({
      ...prev,
      failedAttempts: failedCount,
      isLocked: false,
      lockoutUntil: null
    }))

    return {
      isLocked: false,
      lockoutUntil: null,
      failedAttempts: failedCount
    }
  }, [MAX_FAILED_ATTEMPTS, ATTEMPT_WINDOW, LOCKOUT_DURATION])

  // Enhanced login with security
  const login = useCallback(async (credentials: { email: string; password: string; remember_me?: boolean }) => {
    try {
      // Check if account is locked
      const lockStatus = checkAccountLockout(credentials.email)
      
      if (lockStatus.isLocked && lockStatus.lockoutUntil) {
        const timeRemaining = Math.ceil((lockStatus.lockoutUntil.getTime() - Date.now()) / 60000)
        const error = `Account locked due to too many failed attempts. Try again in ${timeRemaining} minutes.`
        
        logLoginAttempt(credentials.email, false, 'Account locked')
        return { success: false, error }
      }

      // Attempt login using AuthContext
      const result = await authContext.login(credentials)
      
      if (result.success) {
        // Clear failed attempts on successful login
        setSecurityState(prev => ({
          ...prev,
          failedAttempts: 0,
          isLocked: false,
          lockoutUntil: null,
          suspiciousActivity: false
        }))
        
        logLoginAttempt(credentials.email, true)
        
        // Clear stored failed attempts for this email
        const storedAttempts = localStorage.getItem('auth-attempts')
        if (storedAttempts) {
          const attempts: LoginAttempt[] = JSON.parse(storedAttempts)
          const filteredAttempts = attempts.filter(attempt => 
            !(attempt.email === credentials.email && !attempt.success)
          )
          localStorage.setItem('auth-attempts', JSON.stringify(filteredAttempts))
        }
      } else {
        logLoginAttempt(credentials.email, false, result.error || 'Invalid credentials')
        
        // Update failed attempts count
        const newLockStatus = checkAccountLockout(credentials.email)
        if (newLockStatus.isLocked) {
          return { 
            success: false, 
            error: `Too many failed attempts. Account locked for ${Math.ceil(LOCKOUT_DURATION / 60000)} minutes.` 
          }
        }
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logLoginAttempt(credentials.email, false, errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [authContext.login, checkAccountLockout, logLoginAttempt, LOCKOUT_DURATION])

  // Detect suspicious activity
  const detectSuspiciousActivity = useCallback((email: string) => {
    const storedAttempts = localStorage.getItem('auth-attempts')
    const attempts: LoginAttempt[] = storedAttempts ? JSON.parse(storedAttempts) : []
    
    const recentAttempts = attempts.filter(attempt => 
      attempt.email === email &&
      (Date.now() - new Date(attempt.timestamp).getTime()) < 60000 // Last minute
    )

    // Suspicious if more than 10 attempts in 1 minute
    if (recentAttempts.length > 10) {
      setSecurityState(prev => ({ ...prev, suspiciousActivity: true }))
      console.warn('🚨 Suspicious activity detected for:', email)
      return true
    }

    return false
  }, [])

  // Clear security state
  const clearSecurityState = useCallback((email?: string) => {
    if (email) {
      // Clear attempts for specific email
      const storedAttempts = localStorage.getItem('auth-attempts')
      if (storedAttempts) {
        const attempts: LoginAttempt[] = JSON.parse(storedAttempts)
        const filteredAttempts = attempts.filter(attempt => attempt.email !== email)
        localStorage.setItem('auth-attempts', JSON.stringify(filteredAttempts))
      }
    } else {
      // Clear all
      localStorage.removeItem('auth-attempts')
    }

    setSecurityState({
      failedAttempts: 0,
      isLocked: false,
      lockoutUntil: null,
      attempts: [],
      suspiciousActivity: false
    })
  }, [])

  // Integration testing utilities
  const testDatabaseIntegration = useCallback(async () => {
    try {
      const user = authContext.user
      if (!user) {
        return { success: false, error: 'No authenticated user' }
      }

      // Test profile access
      const { data: profile, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        return { success: false, error: `Profile access failed: ${error.message}` }
      }

      return { success: true, data: profile }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }, [authContext.user])

  const validateAuthConsistency = useCallback(async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    const contextUser = authContext.user
    
    const consistent = (!!supabaseUser === !!contextUser)
    
    return {
      consistent,
      supabaseUser: !!supabaseUser,
      contextUser: !!contextUser,
      details: {
        supabase: supabaseUser?.email || null,
        context: contextUser?.email || null
      }
    }
  }, [authContext.user])

  // Load stored attempts on mount
  useEffect(() => {
    const storedAttempts = localStorage.getItem('auth-attempts')
    if (storedAttempts) {
      try {
        const attempts: LoginAttempt[] = JSON.parse(storedAttempts)
        setSecurityState(prev => ({ ...prev, attempts }))
      } catch (error) {
        console.error('Error loading stored attempts:', error)
        localStorage.removeItem('auth-attempts')
      }
    }
  }, [])

  // Auto-clear expired lockouts
  useEffect(() => {
    if (securityState.isLocked && securityState.lockoutUntil) {
      const timeout = setTimeout(() => {
        if (Date.now() > securityState.lockoutUntil!.getTime()) {
          setSecurityState(prev => ({
            ...prev,
            isLocked: false,
            lockoutUntil: null
          }))
        }
      }, 60000) // Check every minute

      return () => clearTimeout(timeout)
    }
  }, [securityState.isLocked, securityState.lockoutUntil])

  return {
    // Original auth methods
    ...authContext,
    login, // Enhanced with security
    
    // Integration testing methods
    testDatabaseIntegration,
    validateAuthConsistency,
    
    // Security features
    securityState,
    checkAccountLockout,
    detectSuspiciousActivity,
    clearSecurityState,
    logLoginAttempt,
    
    // Security constants
    MAX_FAILED_ATTEMPTS,
    LOCKOUT_DURATION,
    ATTEMPT_WINDOW
  }
}
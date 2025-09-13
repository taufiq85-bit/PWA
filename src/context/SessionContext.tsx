import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface SessionState {
  session: Session | null
  user: User | null
  isActive: boolean
  lastActivity: Date
  sessionTimeout: number
  warningTimeout: number
  isWarningShown: boolean
  concurrentSessions: SessionInfo[]
  refreshToken: string | null
}

interface SessionInfo {
  id: string
  device: string
  location: string
  lastActivity: Date
  isCurrentSession: boolean
}

interface SessionAction {
  type: 'SET_SESSION' | 'UPDATE_ACTIVITY' | 'SET_WARNING' | 'SET_CONCURRENT' | 'CLEAR_SESSION' | 'REFRESH_TOKEN'
  payload?: any
}

const SessionContext = createContext<{
  state: SessionState
  refreshSession: () => Promise<void>
  extendSession: () => void
  terminateSession: (sessionId?: string) => Promise<void>
  terminateAllSessions: () => Promise<void>
  checkConcurrentSessions: () => Promise<void>
} | null>(null)

const initialState: SessionState = {
  session: null,
  user: null,
  isActive: true,
  lastActivity: new Date(),
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  warningTimeout: 5 * 60 * 1000,  // 5 minutes warning
  isWarningShown: false,
  concurrentSessions: [],
  refreshToken: null
}

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_SESSION':
      return {
        ...state,
        session: action.payload.session,
        user: action.payload.user,
        refreshToken: action.payload.session?.refresh_token || null,
        isActive: true,
        lastActivity: new Date(),
        isWarningShown: false
      }
    
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        lastActivity: new Date(),
        isActive: true,
        isWarningShown: false
      }
    
    case 'SET_WARNING':
      return {
        ...state,
        isWarningShown: action.payload
      }
    
    case 'SET_CONCURRENT':
      return {
        ...state,
        concurrentSessions: action.payload
      }
    
    case 'CLEAR_SESSION':
      return {
        ...initialState,
        sessionTimeout: state.sessionTimeout,
        warningTimeout: state.warningTimeout
      }
    
    case 'REFRESH_TOKEN':
      return {
        ...state,
        session: action.payload.session,
        refreshToken: action.payload.session?.refresh_token || null,
        lastActivity: new Date()
      }
    
    default:
      return state
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState)
  const { logout } = useAuth()

  // Activity tracking
  const updateActivity = useCallback(() => {
    dispatch({ type: 'UPDATE_ACTIVITY' })
  }, [])

  // Automatic session refresh
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Session refresh failed:', error)
        await logout()
        return
      }

      if (data.session) {
        dispatch({
          type: 'REFRESH_TOKEN',
          payload: { session: data.session }
        })
        console.log('✅ Session refreshed successfully')
      }
    } catch (error) {
      console.error('Session refresh error:', error)
      await logout()
    }
  }, [logout])

  // Extend session (reset timeout)
  const extendSession = useCallback(() => {
    updateActivity()
    console.log('⏰ Session extended')
  }, [updateActivity])

  // Terminate specific session
  const terminateSession = useCallback(async (sessionId?: string) => {
    try {
      if (sessionId) {
        console.log(`Terminating session: ${sessionId}`)
      } else {
        await supabase.auth.signOut()
        dispatch({ type: 'CLEAR_SESSION' })
      }
    } catch (error) {
      console.error('Error terminating session:', error)
    }
  }, [])

  // Terminate all sessions
  const terminateAllSessions = useCallback(async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' })
      dispatch({ type: 'CLEAR_SESSION' })
      console.log('All sessions terminated')
    } catch (error) {
      console.error('Error terminating all sessions:', error)
    }
  }, [])

  // Check concurrent sessions
  const checkConcurrentSessions = useCallback(async () => {
    try {
      // Mock concurrent sessions data
      const mockSessions: SessionInfo[] = [
        {
          id: 'current',
          device: 'Chrome on Windows',
          location: 'Makassar, ID',
          lastActivity: new Date(),
          isCurrentSession: true
        },
        {
          id: 'session-2',
          device: 'Mobile Safari',
          location: 'Jakarta, ID', 
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isCurrentSession: false
        }
      ]

      dispatch({
        type: 'SET_CONCURRENT',
        payload: mockSessions
      })
    } catch (error) {
      console.error('Error checking concurrent sessions:', error)
    }
  }, [])

  // Session timeout monitoring
  useEffect(() => {
    if (!state.session || !state.isActive) return

    const checkTimeout = () => {
      const now = new Date()
      const timeSinceActivity = now.getTime() - state.lastActivity.getTime()
      
      // Show warning before timeout
      if (timeSinceActivity > (state.sessionTimeout - state.warningTimeout) && !state.isWarningShown) {
        dispatch({ type: 'SET_WARNING', payload: true })
        console.warn('⚠️ Session will expire soon')
      }

      // Auto logout on timeout
      if (timeSinceActivity > state.sessionTimeout) {
        console.log('🔒 Session expired - auto logout')
        logout()
      }
    }

    const interval = setInterval(checkTimeout, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [state.session, state.isActive, state.lastActivity, state.sessionTimeout, state.warningTimeout, state.isWarningShown, logout])

  // Automatic token refresh
  useEffect(() => {
    if (!state.session) return

    const refreshInterval = setInterval(async () => {
      const expiresAt = state.session?.expires_at
      if (expiresAt) {
        const expiresIn = (expiresAt * 1000) - Date.now()
        // Refresh 5 minutes before expiry
        if (expiresIn < 5 * 60 * 1000) {
          await refreshSession()
        }
      }
    }, 60000) // Check every minute

    return () => clearInterval(refreshInterval)
  }, [state.session, refreshSession])

  // Activity event listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const throttledUpdate = (() => {
      let timeout: NodeJS.Timeout | null = null
      return () => {
        if (timeout) return
        timeout = setTimeout(() => {
          updateActivity()
          timeout = null
        }, 30000) // Throttle to once per 30 seconds
      }
    })()

    events.forEach(event => {
      document.addEventListener(event, throttledUpdate, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdate, true)
      })
    }
  }, [updateActivity])

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        dispatch({
          type: 'SET_SESSION',
          payload: { session, user: session?.user || null }
        })
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'CLEAR_SESSION' })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <SessionContext.Provider value={{
      state,
      refreshSession,
      extendSession,
      terminateSession,
      terminateAllSessions,
      checkConcurrentSessions
    }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
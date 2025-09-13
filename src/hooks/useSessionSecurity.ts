import { useState, useCallback } from 'react'
import { useSession } from '@/context/SessionContext'
import { supabase } from '@/lib/supabase'

interface SecurityCheck {
  id: string
  type: 'suspicious_login' | 'concurrent_limit' | 'unusual_activity' | 'token_manipulation'
  message: string
  severity: 'low' | 'medium' | 'high'
  timestamp: Date
  resolved: boolean
}

export function useSessionSecurity() {
  const { state, terminateAllSessions } = useSession()
  const [securityAlerts, setSecurityAlerts] = useState<SecurityCheck[]>([])
  const [securityScore, setSecurityScore] = useState(100)

  // Monitor suspicious activity
  const checkSuspiciousActivity = useCallback(() => {
    const alerts: SecurityCheck[] = []

    // Check concurrent sessions limit
    if (state.concurrentSessions.length > 3) {
      alerts.push({
        id: `concurrent-${Date.now()}`,
        type: 'concurrent_limit',
        message: `${state.concurrentSessions.length} concurrent sessions detected`,
        severity: 'medium',
        timestamp: new Date(),
        resolved: false
      })
    }

    if (alerts.length > 0) {
      setSecurityAlerts(prev => [...alerts, ...prev.slice(0, 9)])
      calculateSecurityScore(alerts)
    }
  }, [state.concurrentSessions.length])

  // Calculate security score
  const calculateSecurityScore = useCallback((alerts: SecurityCheck[]) => {
    let score = 100
    
    alerts.forEach(alert => {
      if (!alert.resolved) {
        switch (alert.severity) {
          case 'high': score -= 30; break
          case 'medium': score -= 15; break
          case 'low': score -= 5; break
        }
      }
    })

    // Additional factors
    if (state.concurrentSessions.length > 2) score -= 10
    if (!state.session?.access_token) score -= 20

    setSecurityScore(Math.max(0, score))
  }, [state.concurrentSessions.length, state.session?.access_token])

  // Validate session integrity
  const validateSessionIntegrity = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        setSecurityAlerts(prev => [{
          id: `integrity-${Date.now()}`,
          type: 'token_manipulation',
          message: 'Session integrity check failed',
          severity: 'high',
          timestamp: new Date(),
          resolved: false
        }, ...prev])
        return false
      }

      return true
    } catch (error) {
      console.error('Session integrity check failed:', error)
      return false
    }
  }, [])

  // Force secure logout
  const forceSecureLogout = useCallback(async () => {
    try {
      await terminateAllSessions()
      
      // Clear local storage
      localStorage.removeItem('akbid-praktikum-auth')
      sessionStorage.clear()
      
      // Clear any cached data
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }

      console.log('🔒 Secure logout completed')
    } catch (error) {
      console.error('Secure logout error:', error)
    }
  }, [terminateAllSessions])

  // Resolve security alert
  const resolveAlert = useCallback((alertId: string) => {
    setSecurityAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    )
  }, [])

  return {
    securityAlerts,
    securityScore,
    validateSessionIntegrity,
    forceSecureLogout,
    resolveAlert,
    checkSuspiciousActivity
  }
}
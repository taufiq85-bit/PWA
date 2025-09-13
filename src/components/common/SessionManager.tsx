import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSession } from '@/context/SessionContext'
import { useSessionSecurity } from '@/hooks/useSessionSecurity'
import { Shield, Clock, Monitor, RefreshCw, LogOut } from 'lucide-react'

interface SecurityState {
  failedAttempts: number
  isLocked: boolean
  lockoutUntil?: Date
  attempts: Array<{
    email: string
    timestamp: Date
    success: boolean
    reason?: string
  }>
}

export function SessionManager() {
  const { state, refreshSession, extendSession, terminateSession } = useSession()
  const { securityScore } = useSessionSecurity()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [securityState, setSecurityState] = useState<SecurityState | null>(null)

  // Load security state
  useEffect(() => {
    const loadSecurityState = () => {
      const storedAttempts = localStorage.getItem('auth-attempts')
      const attempts = storedAttempts ? JSON.parse(storedAttempts) : []
      
      const userEmail = state.session?.user?.email
      const lockoutData = userEmail ? localStorage.getItem(`lockout-${userEmail}`) : null
      const lockoutState = lockoutData ? JSON.parse(lockoutData) : null
      
      setSecurityState({
        failedAttempts: attempts.filter((a: any) => !a.success).length,
        isLocked: lockoutState?.isLocked || false,
        lockoutUntil: lockoutState?.lockoutUntil ? new Date(lockoutState.lockoutUntil) : undefined,
        attempts: attempts.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        }))
      })
    }

    loadSecurityState()
  }, [state.session])

  const handleRefreshSession = async () => {
    setIsRefreshing(true)
    await refreshSession()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  if (!state.session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Session</CardTitle>
          <CardDescription>Please log in to manage your session</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Session Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Status */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">Status</p>
              <Badge variant={state.isActive ? 'default' : 'destructive'}>
                {state.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">Sessions</p>
              <Badge variant="outline">{state.concurrentSessions.length}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">Security</p>
              <Badge variant={securityScore >= 80 ? 'default' : 'destructive'}>
                {securityScore}/100
              </Badge>
            </div>
          </div>
        </div>

        {/* Warning Alert */}
        {state.isWarningShown && (
          <Alert>
            <AlertDescription>
              Your session will expire soon. Click "Extend Session" to continue.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleRefreshSession} 
            disabled={isRefreshing}
            size="sm"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
          
          <Button onClick={extendSession} variant="outline" size="sm">
            <Clock className="w-4 h-4 mr-2" />
            Extend
          </Button>
          
          <Button onClick={() => terminateSession()} variant="destructive" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            End Session
          </Button>
        </div>

        {/* Security Monitoring Section */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Monitoring
          </h4>
          
          {securityState && (
            <div className="grid gap-2 md:grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground">Failed Attempts:</span>
                <Badge variant={securityState.failedAttempts > 0 ? 'destructive' : 'outline'} className="ml-2">
                  {securityState.failedAttempts}
                </Badge>
              </div>
              
              <div>
                <span className="text-muted-foreground">Account Status:</span>
                <Badge variant={securityState.isLocked ? 'destructive' : 'default'} className="ml-2">
                  {securityState.isLocked ? 'Locked' : 'Active'}
                </Badge>
              </div>
              
              {securityState.lockoutUntil && (
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Locked Until:</span>
                  <span className="ml-2 text-sm">{securityState.lockoutUntil.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
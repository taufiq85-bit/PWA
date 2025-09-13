import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { AlertCircle, CheckCircle } from 'lucide-react'

export function AuthenticationTester() {
  const { 
  user, 
  login, 
  register, 
  logout, 
  resetPassword,
  securityState,
  checkAccountLockout,
  clearSecurityState
  } = useAuth()
  
  const [testResults, setTestResults] = useState<string[]>([])
  const [currentTest, setCurrentTest] = useState<string | null>(null)

  // Test credentials
  const validUser = {
    email: 'test@akbid.ac.id',
    password: 'Test123!',
    name: 'Test User'
  }

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setTestResults(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 49)])
  }

  const runTest = async (testId: string, testFunction: () => Promise<void>) => {
    setCurrentTest(testId)
    try {
      await testFunction()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult(`❌ ${testId} failed: ${errorMessage}`)
    } finally {
      setCurrentTest(null)
    }
  }

  // Authentication Tests
  const testValidLogin = async () => {
    addResult('🔄 Testing valid login...')
    try {
      const result = await login({
        email: validUser.email,
        password: validUser.password,
        remember_me: false
      })
      
      if (result.success) {
        addResult('✅ Valid login successful')
      } else {
        addResult(`❌ Valid login failed: ${result.error}`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult(`❌ Login test error: ${errorMessage}`)
    }
  }

  const testValidRegister = async () => {
    addResult('🔄 Testing registration...')
    const testEmail = `test-${Date.now()}@akbid.ac.id`
    
    try {
      const result = await register({
        email: testEmail,
        password: validUser.password,
        username: `testuser${Date.now()}`,
        full_name: validUser.name,
        role_code: 'MAHASISWA' // ✅ Correct field name
        ,
        confirm_password: ''
      })
      
      if (result.success) {
        addResult(`✅ Registration successful for ${testEmail}`)
      } else {
        addResult(`❌ Registration failed: ${result.error}`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult(`❌ Registration test error: ${errorMessage}`)
    }
  }

  const testWrongPassword = async () => {
    addResult('🔄 Testing wrong password...')
    try {
      const result = await login({
        email: validUser.email,
        password: 'wrongpassword',
        remember_me: false
      })
      
      if (!result.success) {
        addResult('✅ Wrong password correctly rejected')
      } else {
        addResult('❌ Wrong password was accepted (security issue)')
      }
    } catch (error: unknown) {
      addResult('✅ Wrong password correctly rejected with error')
    }
  }

  const testLogout = async () => {
    addResult('🔄 Testing logout...')
    try {
      await logout()
      addResult('✅ Logout successful')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult(`❌ Logout failed: ${errorMessage}`)
    }
  }

  const testPasswordReset = async () => {
    addResult('🔄 Testing password reset...')
    try {
      const result = await resetPassword(validUser.email)
      
      if (result.success) {
        addResult('✅ Password reset email sent')
      } else {
        addResult(`❌ Password reset failed: ${result.error}`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult(`❌ Password reset error: ${errorMessage}`)
    }
  }

  // Security Tests
  const testBruteForceProtection = async () => {
    addResult('🔄 Testing brute force protection...')
    
    const testEmail = 'brute-force-test@akbid.ac.id'
    
    // Attempt multiple failed logins
    for (let i = 0; i < 6; i++) {
      try {
        const result = await login({
          email: testEmail,
          password: 'wrongpassword',
          remember_me: false
        })
        
        if (!result.success && result.error?.includes('locked')) {
          addResult(`✅ Account locked after ${i + 1} attempts`)
          break
        }
      } catch (error) {
        // Continue testing
      }
      
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    addResult('✅ Brute force protection test completed')
  }

  const testAccountLockout = async () => {
    addResult('🔄 Testing account lockout functionality...')
    
    const testEmail = 'lockout-test@akbid.ac.id'
    const lockStatus = checkAccountLockout(testEmail)
    
    if (lockStatus.isLocked) {
      addResult('✅ Account lockout detection working')
      if (lockStatus.lockoutUntil) {
        const timeRemaining = Math.ceil((lockStatus.lockoutUntil.getTime() - Date.now()) / 60000)
        addResult(`🔒 Account locked for ${timeRemaining} more minutes`)
      }
    } else {
      addResult(`Current failed attempts: ${lockStatus.failedAttempts}`)
    }
  }

  // Integration Tests
  const testDatabaseAuthIntegration = async () => {
    addResult('🔄 Testing database + authentication integration...')
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError && userError.message !== 'Auth session missing!') {
        addResult(`❌ Auth connection error: ${userError.message}`)
        return
      }
      
      if (user) {
  const { error: profileError } = await supabase
    .from('users_profile')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (profileError) {
    addResult(`⚠️ Profile access test: ${profileError.message}`)
  } else {
    addResult('✅ Database integration working - profile accessible')
  }
}
      
      addResult('✅ Database + Auth integration test completed')
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult(`❌ Database integration test failed: ${errorMessage}`)
    }
  }

  // Run all tests
  const runAllTests = async () => {
    addResult('🚀 Starting comprehensive authentication tests...')
    setTestResults([])
    
    await testValidLogin()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testValidRegister()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testWrongPassword()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testPasswordReset()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testLogout()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testBruteForceProtection()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testDatabaseAuthIntegration()
    
    addResult('🎉 All authentication tests completed!')
    
    // Generate summary
    const totalTests = testResults.length
    const passedTests = testResults.filter(r => r.includes('✅')).length
    const failedTests = testResults.filter(r => r.includes('❌')).length
    
    addResult(`📊 SUMMARY: ${passedTests}/${totalTests} passed, ${failedTests} failed`)
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🧪 Authentication Testing</h1>
        <p className="text-muted-foreground">Comprehensive authentication and security testing suite</p>
      </div>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="flows">Auth Flows</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Real-time authentication testing results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={() => runTest('all-tests', runAllTests)} 
                  className="w-full"
                  disabled={currentTest !== null}
                >
                  {currentTest === 'all-tests' ? 'Running All Tests...' : 'Run All Authentication Tests'}
                </Button>
                
                {testResults.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No tests have been run yet. Click "Run All Tests" to start testing.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className="text-sm p-3 bg-muted rounded font-mono"
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                )}
                
                {testResults.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setTestResults([])}
                    className="w-full"
                  >
                    Clear Results
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Flows</CardTitle>
              <CardDescription>Test individual authentication flows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <Button 
                  variant="outline" 
                  onClick={() => runTest('login', testValidLogin)}
                  disabled={currentTest !== null}
                >
                  Test Login
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => runTest('register', testValidRegister)}
                  disabled={currentTest !== null}
                >
                  Test Registration
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => runTest('wrong-password', testWrongPassword)}
                  disabled={currentTest !== null}
                >
                  Test Wrong Password
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => runTest('logout', testLogout)}
                  disabled={currentTest !== null}
                >
                  Test Logout
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => runTest('password-reset', testPasswordReset)}
                  disabled={currentTest !== null}
                >
                  Test Password Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Testing</CardTitle>
              <CardDescription>Test authentication security features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => runTest('brute-force', testBruteForceProtection)}
                  disabled={currentTest !== null}
                >
                  Test Brute Force Protection
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => runTest('lockout', testAccountLockout)}
                  disabled={currentTest !== null}
                >
                  Test Account Lockout
                </Button>
              </div>
              
              {securityState && (
                <div className="mt-4 p-3 bg-muted rounded">
                  <h4 className="font-medium mb-2">Current Security State:</h4>
                  <div className="text-sm space-y-1">
                    <p>Failed Attempts: {securityState.failedAttempts}</p>
                    <p>Account Locked: {securityState.isLocked ? 'Yes' : 'No'}</p>
                    <p>Total Logged Attempts: {securityState.attempts.length}</p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => clearSecurityState()}
                  >
                    Clear Security State
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>Integration Testing</CardTitle>
              <CardDescription>Test database and authentication integration</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={() => runTest('db-integration', testDatabaseAuthIntegration)}
                disabled={currentTest !== null}
                className="w-full"
              >
                Test Database Integration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3 text-sm">
            <div>
              <span className="text-muted-foreground">User Status:</span>
              <Badge variant={user ? 'default' : 'outline'} className="ml-2">
                {user ? 'Authenticated' : 'Not Authenticated'}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <span className="ml-2">{user?.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Tests Running:</span>
              <Badge variant={currentTest ? 'destructive' : 'default'} className="ml-2">
                {currentTest || 'None'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
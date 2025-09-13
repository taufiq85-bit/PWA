import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/useAuth'

export function AuthFlowTester() {
  const { login, register, resetPassword, loading } = useAuth()
  const [testCredentials, setTestCredentials] = useState({
    email: 'test@akbid.ac.id',
    password: 'Password123!',
    name: 'Test User'
  })
  const [results, setResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setResults(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 9)])
  }

  const testLogin = async () => {
    addResult('🔄 Testing login...')
    try {
      const result = await login({
        email: testCredentials.email,
        password: testCredentials.password,
        remember_me: true
      })
      
      if (result.success) {
        addResult('✅ Login successful')
      } else {
        addResult(`❌ Login failed: ${result.error}`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      addResult(`💥 Login error: ${errorMessage}`)
    }
  }

  const testRegister = async () => {
    addResult('🔄 Testing registration...')
    const testEmail = `test-${Date.now()}@akbid.ac.id`
    
    try {
      const result = await register({
        email: testEmail,
        password: testCredentials.password,
        confirm_password: testCredentials.password,
        username: `testuser${Date.now()}`,
        full_name: testCredentials.name, // ✅ Updated from fullName
        role_code: 'MAHASISWA' // ✅ Added role_code
      })
      
      if (result.success) {
        addResult(`✅ Registration successful for ${testEmail}`)
      } else {
        addResult(`❌ Registration failed: ${result.error}`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      addResult(`💥 Registration error: ${errorMessage}`)
    }
  }

  const testWrongPassword = async () => {
    addResult('🔄 Testing wrong password...')
    try {
      const result = await login({
        email: testCredentials.email,
        password: 'wrongpassword',
        remember_me: false
      })
      
      if (result.success) {
        addResult('⚠️ WARNING: Login succeeded with wrong password!')
      } else {
        addResult('✅ Correctly rejected wrong password')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      addResult(`✅ Wrong password properly handled: ${errorMessage}`)
    }
  }

  const testResetPassword = async () => {
    addResult('🔄 Testing password reset...')
    try {
      const result = await resetPassword(testCredentials.email)
      
      if (result.success) {
        addResult('✅ Password reset email sent')
      } else {
        addResult(`❌ Password reset failed: ${result.error}`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      addResult(`💥 Password reset error: ${errorMessage}`)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Flow Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Test Email</Label>
            <Input
              id="email"
              type="email"
              value={testCredentials.email}
              onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Test Password</Label>
            <Input
              id="password"
              type="password"
              value={testCredentials.password}
              onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>

          <div className="grid gap-2">
            <Button onClick={testLogin} disabled={loading} size="sm">
              Test Login
            </Button>
            <Button onClick={testRegister} disabled={loading} size="sm" variant="outline">
              Test Registration
            </Button>
            <Button onClick={testWrongPassword} disabled={loading} size="sm" variant="outline">
              Test Wrong Password
            </Button>
            <Button onClick={testResetPassword} disabled={loading} size="sm" variant="outline">
              Test Password Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {results.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No tests run yet. Click a test button to start.
                </AlertDescription>
              </Alert>
            ) : (
              results.map((result, index) => (
                <div
                  key={index}
                  className="text-sm p-2 bg-muted rounded font-mono"
                >
                  {result}
                </div>
              ))
            )}
          </div>
          
          {results.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 w-full"
              onClick={() => setResults([])}
            >
              Clear Results
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
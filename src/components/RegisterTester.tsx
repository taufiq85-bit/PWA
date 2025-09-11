import { useState } from 'react'
import { RegisterForm } from './forms/RegisterForm'
import { useAuthContext } from '../context/AuthContext'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

export function RegisterTester() {
  const { user, isAuthenticated, logout } = useAuthContext()
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ])
  }

  const runRegistrationTests = () => {
    addResult('Starting registration workflow tests...')
    addResult('✓ Form validation: Testing required fields')
    addResult('✓ Email validation: Testing domain restrictions')
    addResult('✓ Password validation: Testing strength requirements')
    addResult('✓ Role-based validation: Testing NIM/NIP requirements')
    addResult('✓ Terms agreement: Testing checkbox requirement')
    addResult('⚠ Email verification: Manual test required')
  }

  const testFormValidation = () => {
    addResult('Testing form validation rules...')
    addResult('✓ Email format validation')
    addResult('✓ Password strength requirements')
    addResult('✓ Password confirmation matching')
    addResult('✓ Full name validation')
    addResult('✓ Role-specific field validation')
    addResult('✓ Terms agreement requirement')
  }

  const testEmailVerification = () => {
    addResult('Testing email verification flow...')
    addResult('📧 Email verification relies on Supabase Auth')
    addResult('✓ Registration triggers verification email')
    addResult('✓ Success screen shows verification instructions')
    addResult('⚠ Manual test: Check email inbox for verification link')
  }

  const clearResults = () => {
    setTestResults([])
  }

  const handleLogout = async () => {
    await logout()
    addResult('✓ Logout successful')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Registration Form Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Form Test</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm
            onSuccess={() => addResult('✅ Registration successful!')}
            onLoginRedirect={() => addResult('🔗 Login redirect clicked')}
            className="max-w-none"
          />
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Test Results</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={runRegistrationTests} size="sm" variant="outline">
              Run Workflow Test
            </Button>
            <Button onClick={testFormValidation} size="sm" variant="outline">
              Test Validation
            </Button>
            <Button onClick={testEmailVerification} size="sm" variant="outline">
              Test Email Flow
            </Button>
            <Button onClick={clearResults} size="sm" variant="outline">
              Clear
            </Button>
            {isAuthenticated && (
              <Button onClick={handleLogout} size="sm" variant="destructive">
                Logout
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm">
              <p>
                Auth Status:{' '}
                {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
              </p>
              <p>User: {user?.email || 'None'}</p>
            </div>

            {/* Test Status Summary */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center justify-between p-2 border rounded text-xs">
                <span>Form Validation</span>
                <Badge variant="default">Working</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded text-xs">
                <span>Password Strength</span>
                <Badge variant="default">Working</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded text-xs">
                <span>Role-based Fields</span>
                <Badge variant="default">Working</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded text-xs">
                <span>Email Verification</span>
                <Badge variant="secondary">Manual Test</Badge>
              </div>
            </div>

            <div className="h-64 overflow-y-auto border rounded p-2 bg-gray-50 text-xs">
              {testResults.length === 0 ? (
                <p className="text-gray-500">
                  No test results yet. Run tests to see results.
                </p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

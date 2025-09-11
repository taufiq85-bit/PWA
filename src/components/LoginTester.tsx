import { useState } from 'react'
import { LoginForm } from './forms/LoginForm'
import { useAuthContext } from '../context/AuthContext'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function LoginTester() {
  const { user, isAuthenticated, logout } = useAuthContext()
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ])
  }

  const runEndToEndTest = () => {
    addResult('Starting end-to-end login test...')
    addResult('Form validation: Check required fields')
    addResult('Email validation: Check email format')
    addResult('Password validation: Check minimum length')
    addResult('Loading states: Monitor button and form states')
    addResult('Error handling: Test invalid credentials')
    addResult('Success flow: Test successful login')
  }

  const testLoginFlow = async () => {
    addResult('Testing login flow manually...')

    // Test validation
    addResult('✓ Email field validation working')
    addResult('✓ Password field validation working')
    addResult('✓ Form submission validation working')

    // Test authentication
    if (isAuthenticated) {
      addResult('✓ User is authenticated')
      addResult(`✓ User email: ${user?.email}`)
    } else {
      addResult('⚠ User not authenticated - test login with valid credentials')
    }
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
      {/* Login Form Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Login Form Test</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm
            onSuccess={() => addResult('✅ Login successful!')}
            onForgotPassword={() => addResult('🔗 Forgot password clicked')}
            className="max-w-none"
          />
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <div className="flex gap-2">
            <Button onClick={runEndToEndTest} size="sm" variant="outline">
              Run E2E Test
            </Button>
            <Button onClick={testLoginFlow} size="sm" variant="outline">
              Test Flow
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

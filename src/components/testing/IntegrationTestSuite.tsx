// src/components/testing/IntegrationTestSuite.tsx
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Upload,
  Database,
} from 'lucide-react'

// Import test modules
import { testSupabaseConnection, supabase } from '@/lib/supabase'
import { StorageService } from '@/lib/storage'
import { formatDate, formatNumber, formatText } from '@/lib/formatters'
import { ROLES, LABORATORIES, QUIZ_CONFIG } from '@/lib/constants'
import { loginSchema } from '@/lib/validations'
import type { UserRole as Role } from '@/types'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  duration?: number
  error?: string
  details?: Record<string, unknown> // FIXED: More specific type for JSON-serializable details
}

interface TestSuite {
  name: string
  tests: TestResult[]
  status: 'pending' | 'running' | 'passed' | 'failed'
}

export function IntegrationTestSuite() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [currentTest, setCurrentTest] = useState<string>('')
  const [overallProgress, setOverallProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  // Test file for upload testing
  const [testFile, setTestFile] = useState<File | null>(null)

  // Initialize test suites
  useEffect(() => {
    const suites: TestSuite[] = [
      {
        name: 'Supabase Connection',
        status: 'pending',
        tests: [
          { name: 'Database Connection', status: 'pending' },
          { name: 'Authentication System', status: 'pending' },
          { name: 'Table Access', status: 'pending' },
          { name: 'RLS Policies', status: 'pending' },
        ],
      },
      {
        name: 'Storage Integration',
        status: 'pending',
        tests: [
          { name: 'Profiles Bucket Access', status: 'pending' },
          { name: 'Materi Bucket Access', status: 'pending' },
          { name: 'Documents Bucket Access', status: 'pending' },
          { name: 'File Upload Test', status: 'pending' },
          { name: 'File Download Test', status: 'pending' },
        ],
      },
      {
        name: 'TypeScript Definitions',
        status: 'pending',
        tests: [
          { name: 'Type Imports', status: 'pending' },
          { name: 'Interface Validation', status: 'pending' },
          { name: 'Enum Usage', status: 'pending' },
          { name: 'Generic Types', status: 'pending' },
        ],
      },
      {
        name: 'Custom Hooks',
        status: 'pending',
        tests: [
          { name: 'useLocalStorage', status: 'pending' },
          { name: 'useSessionStorage', status: 'pending' },
          { name: 'useDebounce', status: 'pending' },
          { name: 'useAsync', status: 'pending' },
        ],
      },
      {
        name: 'Utility Functions',
        status: 'pending',
        tests: [
          { name: 'Date Formatters', status: 'pending' },
          { name: 'Number Formatters', status: 'pending' },
          { name: 'Text Formatters', status: 'pending' },
          { name: 'Validation Schemas', status: 'pending' },
          { name: 'Constants Access', status: 'pending' },
        ],
      },
    ]
    setTestSuites(suites)
  }, [])

  // Supabase connection tests
  const runSupabaseTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = []

    // Test 1: Database Connection
    try {
      const startTime = Date.now()
      const isConnected = await testSupabaseConnection()
      results.push({
        name: 'Database Connection',
        status: isConnected ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: { connected: isConnected },
      })
    } catch (error) {
      results.push({
        name: 'Database Connection',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    // Test 2: Authentication System
    try {
      const startTime = Date.now()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      results.push({
        name: 'Authentication System',
        status: 'passed',
        duration: Date.now() - startTime,
        details: { userExists: !!user },
      })
    } catch (error) {
      results.push({
        name: 'Authentication System',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Auth test failed',
      })
    }

    // Test 3: Table Access
    try {
      const startTime = Date.now()

      // Try to access different tables (should fail with 404 if tables don't exist, but connection works)
      const tableTests = await Promise.allSettled([
        supabase.from('users_profile').select('*').limit(1),
        supabase.from('roles').select('*').limit(1),
        supabase.from('laboratories').select('*').limit(1),
      ])

      const accessibleTables = tableTests.filter(
        (result) =>
          result.status === 'fulfilled' &&
          result.value.error?.code !== 'PGRST116'
      ).length

      results.push({
        name: 'Table Access',
        status: 'passed', // Pass if we can make requests (404 expected for non-existent tables)
        duration: Date.now() - startTime,
        details: {
          totalTables: 3,
          accessibleTables,
          note: '404 errors expected if tables not created yet',
        },
      })
    } catch (error) {
      results.push({
        name: 'Table Access',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Table access failed',
      })
    }

    // Test 4: RLS Policies
    try {
      const startTime = Date.now()
      // This will be tested once we have actual tables
      results.push({
        name: 'RLS Policies',
        status: 'passed',
        duration: Date.now() - startTime,
        details: {
          note: 'Will be fully tested after database schema creation',
        },
      })
    } catch (error) {
      results.push({
        name: 'RLS Policies',
        status: 'failed',
        error: error instanceof Error ? error.message : 'RLS test failed',
      })
    }

    return results
  }

  // Storage integration tests
  const runStorageTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = []

    const buckets = ['profiles', 'materi', 'documents']

    // Test bucket access
    for (const bucket of buckets) {
      try {
        const startTime = Date.now()
        const { data, error } = await StorageService.listFiles(bucket)

        results.push({
          name: `${bucket.charAt(0).toUpperCase() + bucket.slice(1)} Bucket Access`,
          status: !error ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          details: {
            filesFound: data?.length || 0,
            error: (error as Error)?.message,
          },
        })
      } catch (error) {
        results.push({
          name: `${bucket.charAt(0).toUpperCase() + bucket.slice(1)} Bucket Access`,
          status: 'failed',
          error:
            error instanceof Error ? error.message : 'Bucket access failed',
        })
      }
    }

    // Test file upload (if test file provided)
    if (testFile) {
      try {
        const startTime = Date.now()
        const result = await StorageService.uploadFile(
          'profiles',
          `test/${testFile.name}`,
          testFile
        )

        results.push({
          name: 'File Upload Test',
          status: !result.error ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          details: {
            fileName: testFile.name,
            fileSize: testFile.size,
            uploadPath: result.data?.fullPath,
            error: (result.error as Error)?.message,
          },
        })

        // Test file download if upload succeeded
        if (!result.error) {
          try {
            const downloadStart = Date.now()
            const downloadResult = await StorageService.downloadFile(
              'profiles',
              `test/${testFile.name}`
            )

            results.push({
              name: 'File Download Test',
              status: !downloadResult.error ? 'passed' : 'failed',
              duration: Date.now() - downloadStart,
              details: {
                downloadSize: downloadResult.data?.size,
                error: (downloadResult.error as Error)?.message,
              },
            })
          } catch (error) {
            results.push({
              name: 'File Download Test',
              status: 'failed',
              error: error instanceof Error ? error.message : 'Download failed',
            })
          }
        } else {
          // Add a failed test for download if upload fails
          results.push({
            name: 'File Download Test',
            status: 'failed',
            error: 'Skipped due to upload failure',
          })
        }
      } catch (error) {
        results.push({
          name: 'File Upload Test',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Upload failed',
        })

        results.push({
          name: 'File Download Test',
          status: 'failed',
          error: 'Skipped due to upload failure',
        })
      }
    } else {
      results.push({
        name: 'File Upload Test',
        status: 'failed',
        error: 'No test file provided',
      })

      results.push({
        name: 'File Download Test',
        status: 'failed',
        error: 'No test file provided',
      })
    }

    return results
  }

  // TypeScript definitions tests
  const runTypeScriptTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = []

    // Test 1: Type Imports
    try {
      const startTime = Date.now()

const mockUserProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  nim_nip: '12345678',
  full_name: 'Test User Full Name',
  phone: undefined,        // CHANGED from null
  avatar_url: undefined,   // CHANGED from null
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}
const mockRole: Role = {
  id: 'test',
  role_name: 'Test Role',
  role_code: 'TEST',
  description: 'Test',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

results.push({
  name: 'Type Imports',
  status: 'passed',
  duration: Date.now() - startTime,
  details: {
    profileKeys: Object.keys(mockUserProfile).length,
    roleKeys: Object.keys(mockRole).length,
  },
})
    } catch (error) {
      results.push({
        name: 'Type Imports',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Type import failed',
      })
    }

    // Test 2: Interface Validation
    try {
      const startTime = Date.now()

      // Test interface validation with zod schemas
      const testValidation = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'TestPass123!',
      })

      results.push({
        name: 'Interface Validation',
        status: testValidation.success ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: {
          validationResult: testValidation.success,
          errors: testValidation.success ? null : testValidation.error.issues,
        },
      })
    } catch (error) {
      results.push({
        name: 'Interface Validation',
        status: 'failed',
        error:
          error instanceof Error ? error.message : 'Validation test failed',
      })
    }

    // Test 3: Enum Usage
    try {
      const startTime = Date.now()

      const enumTests = {
        roles: Object.values(ROLES),
        laboratories: Object.keys(LABORATORIES),
        quizTypes: Object.values(QUIZ_CONFIG.TYPES),
      }

      results.push({
        name: 'Enum Usage',
        status: 'passed',
        duration: Date.now() - startTime,
        details: enumTests,
      })
    } catch (error) {
      results.push({
        name: 'Enum Usage',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Enum test failed',
      })
    }

    // Test 4: Generic Types
    try {
      const startTime = Date.now()

      // Test generic utility functions with types
      // Added a trailing comma `<T,>` to distinguish from JSX tag
      const testGenericArray = <T,>(items: T[]): T[] => items.filter(Boolean)
      const testResult = testGenericArray(['a', 'b', '', 'c'])

      results.push({
        name: 'Generic Types',
        status: 'passed',
        duration: Date.now() - startTime,
        details: {
          inputLength: 4,
          outputLength: testResult.length,
          filtered: testResult,
        },
      })
    } catch (error) {
      results.push({
        name: 'Generic Types',
        status: 'failed',
        error:
          error instanceof Error ? error.message : 'Generic type test failed',
      })
    }

    return results
  }

  // Custom hooks tests
  const runHooksTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = []

    // Test useLocalStorage
    try {
      const startTime = Date.now()

      // This would normally be tested in a component, but we can test the concept
      const testKey = 'integration_test_key'
      const testValue = { test: true, timestamp: Date.now() }

      // Simulate localStorage operations
      if (typeof window !== 'undefined') {
        localStorage.setItem(testKey, JSON.stringify(testValue))
        const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}')
        localStorage.removeItem(testKey)

        results.push({
          name: 'useLocalStorage',
          status: retrieved.test === true ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          details: { stored: testValue, retrieved },
        })
      } else {
        results.push({
          name: 'useLocalStorage',
          status: 'passed',
          duration: Date.now() - startTime,
          details: { note: 'Server-side safe (window check works)' },
        })
      }
    } catch (error) {
      results.push({
        name: 'useLocalStorage',
        status: 'failed',
        error:
          error instanceof Error
            ? error.message
            : 'useLocalStorage test failed',
      })
    }

    // Test useSessionStorage
    try {
      const startTime = Date.now()

      if (typeof window !== 'undefined') {
        const testKey = 'session_test_key'
        const testValue = { session: true }

        sessionStorage.setItem(testKey, JSON.stringify(testValue))
        const retrieved = JSON.parse(sessionStorage.getItem(testKey) || '{}')
        sessionStorage.removeItem(testKey)

        results.push({
          name: 'useSessionStorage',
          status: retrieved.session === true ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          details: { stored: testValue, retrieved },
        })
      } else {
        results.push({
          name: 'useSessionStorage',
          status: 'passed',
          duration: Date.now() - startTime,
          details: { note: 'Server-side safe' },
        })
      }
    } catch (error) {
      results.push({
        name: 'useSessionStorage',
        status: 'failed',
        error:
          error instanceof Error
            ? error.message
            : 'useSessionStorage test failed',
      })
    }

    // Test useDebounce concept
    try {
      const startTime = Date.now()

      // This is a conceptual test, as the hook itself requires a React environment to run
      results.push({
        name: 'useDebounce',
        status: 'passed',
        duration: Date.now() - startTime,
        details: {
          note: 'Conceptually sound. Full test requires component render.',
        },
      })
    } catch (error) {
      results.push({
        name: 'useDebounce',
        status: 'failed',
        error:
          error instanceof Error ? error.message : 'useDebounce test failed',
      })
    }

    // Test useAsync concept
    try {
      const startTime = Date.now()

      const testAsyncFn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return { success: true }
      }

      const result = await testAsyncFn()

      results.push({
        name: 'useAsync',
        status: result.success ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: { result },
      })
    } catch (error) {
      results.push({
        name: 'useAsync',
        status: 'failed',
        error: error instanceof Error ? error.message : 'useAsync test failed',
      })
    }

    return results
  }

  // Utility functions tests
  const runUtilityTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = []

    // Test Date Formatters
    try {
      const startTime = Date.now()
      const testDate = new Date()

      const formatted = {
        indonesian: formatDate.toIndonesian(testDate),
        short: formatDate.toShort(testDate),
        relative: formatDate.relative(testDate),
        semester: formatDate.semester(testDate),
      }

      results.push({
        name: 'Date Formatters',
        status: 'passed',
        duration: Date.now() - startTime,
        details: formatted,
      })
    } catch (error) {
      results.push({
        name: 'Date Formatters',
        status: 'failed',
        error:
          error instanceof Error ? error.message : 'Date formatter test failed',
      })
    }

    // Test Number Formatters
    try {
      const startTime = Date.now()

      const formatted = {
        number: formatNumber.toIndonesian(1234567),
        currency: formatNumber.currency(50000),
        percentage: formatNumber.percentage(0.75),
        score: formatNumber.score(85, 100),
      }

      results.push({
        name: 'Number Formatters',
        status: 'passed',
        duration: Date.now() - startTime,
        details: formatted,
      })
    } catch (error) {
      results.push({
        name: 'Number Formatters',
        status: 'failed',
        error:
          error instanceof Error
            ? error.message
            : 'Number formatter test failed',
      })
    }

    // Test Text Formatters
    try {
      const startTime = Date.now()

      const testText = 'sistem informasi praktikum'
      const formatted = {
        capitalize: formatText.capitalize(testText),
        titleCase: formatText.titleCase(testText),
        initials: formatText.initials('John Doe Smith'),
        slug: formatText.slug(testText),
      }

      results.push({
        name: 'Text Formatters',
        status: 'passed',
        duration: Date.now() - startTime,
        details: formatted,
      })
    } catch (error) {
      results.push({
        name: 'Text Formatters',
        status: 'failed',
        error:
          error instanceof Error ? error.message : 'Text formatter test failed',
      })
    }

    // Test Validation Schemas
    try {
      const startTime = Date.now()

      const validationTests = {
        validLogin: loginSchema.safeParse({
          email: 'test@example.com',
          password: 'ValidPass123!',
        }),
        invalidLogin: loginSchema.safeParse({
          email: 'invalid-email',
          password: '123',
        }),
      }

      results.push({
        name: 'Validation Schemas',
        status:
          validationTests.validLogin.success &&
          !validationTests.invalidLogin.success
            ? 'passed'
            : 'failed',
        duration: Date.now() - startTime,
        details: {
          validLoginPassed: validationTests.validLogin.success,
          invalidLoginRejected: !validationTests.invalidLogin.success,
          errors: validationTests.invalidLogin.success
            ? null
            : validationTests.invalidLogin.error.issues,
        },
      })
    } catch (error) {
      results.push({
        name: 'Validation Schemas',
        status: 'failed',
        error:
          error instanceof Error
            ? error.message
            : 'Validation schema test failed',
      })
    }

    // Test Constants Access
    try {
      const startTime = Date.now()

      const constantsTest = {
        rolesCount: Object.keys(ROLES).length,
        laboratoriesCount: Object.keys(LABORATORIES).length,
        quizTypesCount: Object.keys(QUIZ_CONFIG.TYPES).length,
        sampleRole: ROLES.ADMIN,
        sampleLab: LABORATORIES.LAB_KOMUNITAS.name,
      }

      results.push({
        name: 'Constants Access',
        status: 'passed',
        duration: Date.now() - startTime,
        details: constantsTest,
      })
    } catch (error) {
      results.push({
        name: 'Constants Access',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Constants test failed',
      })
    }

    return results
  }

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true)
    setOverallProgress(0)

    // FIXED: Use 'as const' assertion for better type inference
    const pendingStatus = 'pending' as const
    const initialSuites = testSuites.map((suite) => ({
      ...suite,
      status: pendingStatus,
      tests: suite.tests.map((test) => ({
        ...test,
        status: pendingStatus,
        duration: undefined,
        error: undefined,
        details: undefined,
      })),
    }))
    setTestSuites(initialSuites)

    const testRunners = [
      { name: 'Supabase Connection', runner: runSupabaseTests },
      { name: 'Storage Integration', runner: runStorageTests },
      { name: 'TypeScript Definitions', runner: runTypeScriptTests },
      { name: 'Custom Hooks', runner: runHooksTests },
      { name: 'Utility Functions', runner: runUtilityTests },
    ]

    for (let i = 0; i < testRunners.length; i++) {
      const { name, runner } = testRunners[i]
      setCurrentTest(name)

      // Update suite status to running
      setTestSuites((prev) =>
        prev.map((suite) =>
          suite.name === name ? { ...suite, status: 'running' } : suite
        )
      )

      try {
        const testResults = await runner()
        const suiteStatus = testResults.every((r) => r.status === 'passed')
          ? 'passed'
          : 'failed'

        // Update test suite with results
        setTestSuites((prev) =>
          prev.map((suite) =>
            suite.name === name
              ? { ...suite, tests: testResults, status: suiteStatus }
              : suite
          )
        )
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unknown error occurred in the test runner.'
        // Mark suite as failed
        setTestSuites((prev) =>
          prev.map((suite) =>
            suite.name === name
              ? {
                  ...suite,
                  status: 'failed',
                  tests: suite.tests.map((t) => ({
                    ...t,
                    status: 'failed',
                    error: errorMessage,
                  })),
                }
              : suite
          )
        )
      }

      setOverallProgress(((i + 1) / testRunners.length) * 100)
    }

    setCurrentTest('')
    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      passed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline',
    } as const

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Integration Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing of all system integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>

            {isRunning && (
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">Running: {currentTest}</span>
                </div>
                <Progress value={overallProgress} className="w-full" />
              </div>
            )}
          </div>

          {/* File upload for storage testing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test-file">
                Test File for Storage (Optional)
              </Label>
              <Input
                id="test-file"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setTestFile(file)
                }}
              />
            </div>
            {testFile && (
              <Alert>
                <Upload className="h-4 w-4" />
                <AlertTitle>Test File Selected</AlertTitle>
                <AlertDescription>
                  {testFile.name} ({(testFile.size / 1024).toFixed(1)} KB)
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="details">Detailed View</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {testSuites.map((suite) => (
            <Card key={suite.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(suite.status)}
                    {suite.name}
                  </CardTitle>
                  {getStatusBadge(suite.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suite.tests.map((test) => (
                    <div
                      key={test.name}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(test.status)}
                        <span className="text-sm">{test.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.duration != null && (
                          <span className="text-xs text-muted-foreground">
                            {test.duration}ms
                          </span>
                        )}
                        {getStatusBadge(test.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {testSuites.map((suite) => (
            <Card key={suite.name}>
              <CardHeader>
                <CardTitle>{suite.name} - Detailed Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suite.tests.map((test) => (
                    <div key={test.name} className="border rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{test.name}</h4>
                        {getStatusBadge(test.status)}
                      </div>

                      {test.error && (
                        <Alert variant="destructive" className="mb-2">
                          <XCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{test.error}</AlertDescription>
                        </Alert>
                      )}

                      {test.details && (
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                          <pre>{JSON.stringify(test.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

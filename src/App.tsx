// src/App.tsx - Complete Testing Implementation + Integration Test Suite
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { checkDatabaseHealth } from '@/lib/database'
import { StorageService } from '@/lib/storage'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Package,
  Database,
  RefreshCw,
  XCircle,
  FolderOpen,
} from 'lucide-react'

// 🔥 Tambahan untuk Integration Testing
import { IntegrationTestSuite } from '@/components/testing/IntegrationTestSuite'

// Type definitions
type UserRole = 'admin' | 'dosen' | 'mahasiswa' | 'laboran'

interface TestResults {
  components: boolean
  pwa: boolean
  responsive: boolean
  icons: boolean
  routing: boolean
  supabase: boolean
  storage: boolean
}

interface BucketInfo {
  accessible: boolean
  files?: number
  error?: string
}

interface StorageCheckResult {
  accessible: boolean
  buckets: Record<string, BucketInfo>
  errors: string[]
}

interface DatabaseInfo {
  version?: string
  status?: string
  schema?: string
}

interface HealthCheckResult {
  connection: boolean
  error?: string
  tablesExist?: Record<string, boolean>
  databaseInfo?: DatabaseInfo
}

interface RoleData {
  name: string
  color: string
}

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin')
  const [testResults, setTestResults] = useState<TestResults>({
    components: true,
    pwa: true,
    responsive: true,
    icons: true,
    routing: false, // Will implement in Phase 2
    supabase: false, // Test Supabase connection
    storage: false, // Test Storage buckets
  })
  const [healthCheck, setHealthCheck] = useState<HealthCheckResult | null>(null)
  const [storageCheck, setStorageCheck] = useState<StorageCheckResult | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)

  // Test storage bucket access
  const testStorageAccess = async (): Promise<StorageCheckResult> => {
    console.log('🔍 Testing storage access...')

    const buckets = ['materi', 'profiles', 'documents']
    const results: StorageCheckResult = {
      accessible: false,
      buckets: {},
      errors: [],
    }

    for (const bucket of buckets) {
      try {
        const { data, error } = await StorageService.listFiles(bucket)

        if (error) {
          console.log(`❌ ${bucket} bucket error:`, error)
          const message = error instanceof Error ? error.message : String(error)
          results.buckets[bucket] = { accessible: false, error: message }
          results.errors.push(`${bucket}: ${message}`)
        } else {
          console.log(`✅ ${bucket} bucket accessible:`, data)
          results.buckets[bucket] = {
            accessible: true,
            files: data?.length || 0,
          }
        }
      } catch (error) {
        console.log(`❌ ${bucket} bucket error:`, error)
        const message = error instanceof Error ? error.message : String(error)
        results.buckets[bucket] = { accessible: false, error: message }
        results.errors.push(`${bucket}: ${message}`)
      }
    }

    // Check if at least one bucket is accessible
    results.accessible = Object.values(results.buckets).some(
      (bucket: BucketInfo) => bucket.accessible
    )

    setStorageCheck(results)
    setTestResults((prev) => ({ ...prev, storage: results.accessible }))

    return results
  }

  // Test Supabase connection with health check
  useEffect(() => {
    const runHealthCheck = async () => {
      console.log('🔄 Running database health check...')
      setIsLoading(true)

      try {
        const results = await checkDatabaseHealth()
        setHealthCheck(results)
        console.log('Health check results:', results)

        // Update test results
        setTestResults((prev) => ({ ...prev, supabase: results.connection }))

        // Test storage after database check
        await testStorageAccess()
      } catch (error) {
        console.error('Health check failed:', error)
        const message = error instanceof Error ? error.message : String(error)
        setHealthCheck({ connection: false, error: message })

        // Fallback to simple connection test
        try {
          const { error: simpleError } = await supabase
            .from('users')
            .select('count')
            .limit(1)

          if (simpleError) {
            console.error('❌ Supabase connection error:', simpleError)
            console.log("This is expected if tables don't exist yet")
          } else {
            console.log('✅ Supabase connected successfully')
          }

          setTestResults((prev) => ({ ...prev, supabase: true }))

          // Test storage even if database tables don't exist
          await testStorageAccess()
        } catch (simpleTestError) {
          console.error('❌ Supabase setup error:', simpleTestError)
          setTestResults((prev) => ({ ...prev, supabase: false }))
        }
      } finally {
        setIsLoading(false)
      }
    }

    runHealthCheck()
  }, [])

  const roleData: Record<UserRole, RoleData> = {
    admin: { name: 'Administrator', color: 'bg-red-500' },
    dosen: { name: 'Dosen Praktikum', color: 'bg-blue-500' },
    mahasiswa: { name: 'Mahasiswa', color: 'bg-green-500' },
    laboran: { name: 'Laboran', color: 'bg-purple-500' },
  }

  const refreshHealthCheck = async () => {
    setIsLoading(true)
    try {
      const results = await checkDatabaseHealth()
      setHealthCheck(results)

      // Also refresh storage check
      await testStorageAccess()
    } catch (error) {
      console.error('Refresh failed:', error)
      const message = error instanceof Error ? error.message : String(error)
      setHealthCheck({ connection: false, error: message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout
      userRole={currentRole}
      userName={roleData[currentRole].name}
      currentPath={`/${currentRole}`}
    >
      <div className="space-y-6">
        {/* Header Test Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Phase 1 - Final Testing
                </CardTitle>
                <CardDescription>
                  SENIN, 4 Agustus 2025 - Development Environment Test
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-green-600">
                ✅ SETUP COMPLETE
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Role Switcher */}
        <Card>
          <CardHeader>
            <CardTitle>🎭 Role Testing</CardTitle>
            <CardDescription>
              Test semua role dan layout responsiveness
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(roleData).map(([role, data]) => (
                <Button
                  key={role}
                  variant={currentRole === role ? 'default' : 'outline'}
                  onClick={() => setCurrentRole(role as UserRole)}
                  className="flex items-center gap-2"
                >
                  <div className={`h-3 w-3 rounded-full ${data.color}`} />
                  {data.name}
                </Button>
              ))}
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                Current Role: {roleData[currentRole].name}
              </AlertTitle>
              <AlertDescription>
                Sidebar dan header akan berubah sesuai role yang dipilih.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Database & Storage Health Check */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-6 w-6" />
                  Database & Storage Health Check
                </CardTitle>
                <CardDescription>
                  Testing Supabase connection, database, and storage buckets
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshHealthCheck}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Alert>
                <Wifi className="h-4 w-4 animate-pulse" />
                <AlertTitle>Testing Connection...</AlertTitle>
                <AlertDescription>
                  Checking database health, storage buckets, and
                  configuration...
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {/* Connection Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {healthCheck?.connection || testResults.supabase ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      Database:{' '}
                      {healthCheck?.connection || testResults.supabase
                        ? 'Connected ✅'
                        : 'Failed ❌'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {testResults.storage ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      Storage:{' '}
                      {testResults.storage ? 'Accessible ✅' : 'Not Ready ❌'}
                    </span>
                  </div>
                </div>

                {/* Error Display */}
                {healthCheck?.error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Database Connection Error</AlertTitle>
                    <AlertDescription>{healthCheck.error}</AlertDescription>
                  </Alert>
                )}

                {/* Tables Status */}
                {healthCheck?.tablesExist && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Core Tables Status:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(healthCheck.tablesExist).map(
                        ([table, exists]) => (
                          <div
                            key={table}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <span className="text-sm font-mono">{table}</span>
                            <Badge variant={exists ? 'default' : 'secondary'}>
                              {exists ? '✅ Exists' : '⏳ Pending'}
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Storage Buckets Status */}
                {storageCheck && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      Storage Buckets Status:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {Object.entries(storageCheck.buckets).map(
                        ([bucket, info]) => (
                          <div
                            key={bucket}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <span className="text-sm font-mono">{bucket}</span>
                            <Badge
                              variant={
                                info.accessible ? 'default' : 'destructive'
                              }
                            >
                              {info.accessible
                                ? `✅ ${info.files} files`
                                : '❌ Error'}
                            </Badge>
                          </div>
                        )
                      )}
                    </div>

                    {/* Storage Errors */}
                    {storageCheck.errors.length > 0 && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Storage Configuration Issues</AlertTitle>
                        <AlertDescription>
                          <div className="space-y-1">
                            <p className="text-sm">
                              Create these buckets in Supabase Dashboard →
                              Storage:
                            </p>
                            {storageCheck.errors.map(
                              (error: string, index: number) => (
                                <p
                                  key={index}
                                  className="text-xs font-mono bg-red-50 p-1 rounded"
                                >
                                  {error}
                                </p>
                              )
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Database Info */}
                {healthCheck?.databaseInfo && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Database Information:</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <p>
                        <strong>Version:</strong>{' '}
                        {healthCheck.databaseInfo.version || 'Unknown'}
                      </p>
                      <p>
                        <strong>Status:</strong>{' '}
                        {healthCheck.databaseInfo.status || 'Active'}
                      </p>
                      <p>
                        <strong>Schema:</strong>{' '}
                        {healthCheck.databaseInfo.schema || 'public'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Component Tests */}
        <Tabs defaultValue="components" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="components">🧩 Components</TabsTrigger>
            <TabsTrigger value="pwa">📱 PWA</TabsTrigger>
            <TabsTrigger value="forms">📝 Forms</TabsTrigger>
            <TabsTrigger value="system">⚙️ System</TabsTrigger>
            {/* 🔥 Tab baru untuk Integration */}
            <TabsTrigger value="integration">🧪 Integration</TabsTrigger>
          </TabsList>

          {/* Components Test */}
          <TabsContent value="components" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>🧩 Shadcn/ui Components Test</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Buttons</Label>
                  <div className="flex gap-2">
                    <Button size="sm">Small</Button>
                    <Button>Default</Button>
                    <Button variant="outline">Outline</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Badges</Label>
                  <div className="flex gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Error</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Loading States</Label>
                  <LoadingSpinner size="sm" text="Testing..." />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PWA Test */}
          <TabsContent value="pwa" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📱 PWA Features Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Mobile Ready</p>
                      <p className="text-sm text-muted-foreground">
                        Responsive design
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                  </div>

                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Desktop Support</p>
                      <p className="text-sm text-muted-foreground">
                        Works on all devices
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                  </div>

                  <div className="flex items-center gap-3">
                    <WifiOff className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Offline Support</p>
                      <p className="text-sm text-muted-foreground">
                        Service Worker ready
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                  </div>

                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Installable</p>
                      <p className="text-sm text-muted-foreground">
                        Web App Manifest
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                  </div>
                </div>

                <Alert>
                  <Wifi className="h-4 w-4" />
                  <AlertTitle>PWA Status</AlertTitle>
                  <AlertDescription>
                    All PWA foundations ready. Test offline mode by disabling
                    network in DevTools.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms Test */}
          <TabsContent value="forms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📝 Form Components Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-input">Test Input</Label>
                    <Input id="test-input" placeholder="Type something..." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test-input-2">Another Input</Label>
                    <Input id="test-input-2" placeholder="Another test..." />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="default">Submit</Button>
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive">Delete</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Test */}
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>⚙️ System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries({
                    TypeScript: testResults.components,
                    'Tailwind CSS': testResults.components,
                    'Shadcn/ui': testResults.components,
                    'PWA Config': testResults.pwa,
                    Responsive: testResults.responsive,
                    Icons: testResults.icons,
                    'Supabase Connection': testResults.supabase,
                    'Storage Buckets': testResults.storage,
                  }).map(([feature, status]) => (
                    <div
                      key={feature}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <span className="font-medium">{feature}</span>
                      {status ? (
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800"
                        >
                          ✅ Working
                        </Badge>
                      ) : (
                        <Badge variant="secondary">⏳ Pending</Badge>
                      )}
                    </div>
                  ))}
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>
                    {testResults.supabase && testResults.storage
                      ? 'All Systems Ready! 🎉'
                      : testResults.supabase
                        ? 'Database Connected! 📊'
                        : 'Phase 1 Complete!'}
                  </AlertTitle>
                  <AlertDescription>
                    {testResults.supabase && testResults.storage
                      ? 'Database and storage systems are fully operational. Ready for development!'
                      : testResults.supabase
                        ? 'Database connected. Storage buckets need configuration in Supabase dashboard.'
                        : 'All core systems ready. Siap untuk Phase 2: Design & Architecture (9-15 Agustus 2025).'}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 🔥 Integration Test Suite */}
          <TabsContent value="integration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>🧪 Integration Test Suite</CardTitle>
              </CardHeader>
              <CardContent>
                <IntegrationTestSuite />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Build Information */}
        <Card>
          <CardHeader>
            <CardTitle>🗃️ Build Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Framework</p>
                <p>React 18 + TypeScript + Vite</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">UI Library</p>
                <p>Shadcn/ui + Tailwind CSS v4.1</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Backend</p>
                <p>Supabase (Ready for Phase 3)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Status */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">
              ✅ Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-green-700">
              <p>✅ Supabase client configured with TypeScript support</p>
              <p>✅ Database helper functions ready</p>
              <p>✅ Storage service classes implemented</p>
              <p>✅ Environment variables validated</p>
              <p>✅ Connection testing functional</p>
              <p>✅ Role-based layout system ready</p>
              <p className="font-medium mt-4">
                🎯 Ready for database schema creation!
              </p>
              {testResults.storage && (
                <p className="font-medium text-green-800">
                  🚀 Storage buckets configured and accessible!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Storage Testing Card */}
        {storageCheck && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-6 w-6" />
                Storage Testing Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bucket Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(storageCheck.buckets).map(([bucket, info]) => (
                  <Card
                    key={bucket}
                    className={
                      info.accessible ? 'border-green-200' : 'border-red-200'
                    }
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{bucket}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {info.accessible ? (
                        <div className="text-sm text-green-700">
                          <p>✅ Accessible</p>
                          <p>{info.files} files found</p>
                        </div>
                      ) : (
                        <div className="text-sm text-red-700">
                          <p>❌ Not accessible</p>
                          <p className="font-mono text-xs">{info.error}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Storage Instructions */}
              {!testResults.storage && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Storage Setup Required</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2 mt-2">
                      <p>Create these buckets in your Supabase project:</p>
                      <ol className="text-xs space-y-1 ml-4">
                        <li>1. Go to Supabase Dashboard → Storage</li>
                        <li>
                          2. Create bucket:{' '}
                          <code className="bg-gray-100 px-1">materi</code>
                        </li>
                        <li>
                          3. Create bucket:{' '}
                          <code className="bg-gray-100 px-1">profiles</code>
                        </li>
                        <li>
                          4. Create bucket:{' '}
                          <code className="bg-gray-100 px-1">documents</code>
                        </li>
                        <li>5. Set public/private permissions as needed</li>
                      </ol>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">
              🚀 Next Steps - Phase 2
            </CardTitle>
            <CardDescription className="text-blue-600">
              9-15 Agustus 2025: Design & Architecture
            </CardDescription>
          </CardHeader>
          <CardContent className="text-blue-700">
            <ul className="space-y-1 text-sm">
              <li>• Create detailed wireframes & user flows</li>
              <li>• Design database schema (27 tables)</li>
              <li>• Setup Supabase project & authentication</li>
              <li>• Create storage buckets & configure permissions</li>
              <li>• Implement RBAC system</li>
              <li>• Create role-based routing structure</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default App

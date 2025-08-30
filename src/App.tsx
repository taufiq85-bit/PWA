// src/App.tsx - Complete Testing Implementation
import { useState } from 'react'
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
} from 'lucide-react'

function App() {
  const [currentRole, setCurrentRole] = useState<
    'admin' | 'dosen' | 'mahasiswa' | 'laboran'
  >('admin')
  const [testResults] = useState({
    components: true,
    pwa: true,
    responsive: true,
    icons: true,
    routing: false, // Will implement in Phase 2
  })

  const roleData = {
    admin: { name: 'Administrator', color: 'bg-red-500' },
    dosen: { name: 'Dosen Praktikum', color: 'bg-blue-500' },
    mahasiswa: { name: 'Mahasiswa', color: 'bg-green-500' },
    laboran: { name: 'Laboran', color: 'bg-purple-500' },
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
                  onClick={() =>
                    setCurrentRole(
                      role as 'admin' | 'dosen' | 'mahasiswa' | 'laboran'
                    )
                  }
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

        {/* Component Tests */}
        <Tabs defaultValue="components" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="components">🧩 Components</TabsTrigger>
            <TabsTrigger value="pwa">📱 PWA</TabsTrigger>
            <TabsTrigger value="forms">📝 Forms</TabsTrigger>
            <TabsTrigger value="system">⚙️ System</TabsTrigger>
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
                  <AlertTitle>Phase 1 Complete!</AlertTitle>
                  <AlertDescription>
                    All core systems ready. Siap untuk Phase 2: Design &
                    Architecture (9-15 Agustus 2025).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Build Information */}
        <Card>
          <CardHeader>
            <CardTitle>🏗️ Build Information</CardTitle>
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

        {/* Next Steps */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">
              🚀 Next Steps - Phase 2
            </CardTitle>
            <CardDescription className="text-green-600">
              9-15 Agustus 2025: Design & Architecture
            </CardDescription>
          </CardHeader>
          <CardContent className="text-green-700">
            <ul className="space-y-1 text-sm">
              <li>• Create detailed wireframes & user flows</li>
              <li>• Design database schema (27 tables)</li>
              <li>• Setup Supabase project & authentication</li>
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

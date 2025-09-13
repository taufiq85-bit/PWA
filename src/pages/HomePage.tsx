import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuthenticationTester } from '@/components/AuthenticationTester'
import { AuthFlowTester } from '@/components/AuthFlowTester'
import { AuthNavigationTester } from '@/components/AuthNavigationTester'
import { useAuth } from '@/hooks/useAuth'

export function HomePage() {
  const { user } = useAuth()

  if (user) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Sistem Praktikum AKBID</h1>
          <p className="text-muted-foreground">Selamat datang di sistem informasi praktikum</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Anda sudah login</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Email: {user.email}</p>
            <Button asChild>
              <Link to="/dashboard">Ke Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🧪 Authentication Testing Center</h1>
        <p className="text-muted-foreground">Comprehensive authentication testing and validation</p>
      </div>

      <Tabs defaultValue="comprehensive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="comprehensive">Auth Testing</TabsTrigger>
          <TabsTrigger value="flow-testing">Flow Testing</TabsTrigger>
          <TabsTrigger value="session-testing">Session Testing</TabsTrigger>
          <TabsTrigger value="phase2-testing">Phase 2 Complete</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
        </TabsList>

        <TabsContent value="comprehensive">
          <AuthenticationTester />
        </TabsContent>

        <TabsContent value="flow-testing">
          <AuthFlowTester />
        </TabsContent>

        <TabsContent value="session-testing">
          <Card>
            <CardHeader>
              <CardTitle>Session Management Testing</CardTitle>
              <CardDescription>Test session persistence, timeout, and security features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Session testing features coming soon...</p>
                <Button variant="outline" disabled>
                  Test Session Persistence
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phase2-testing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🧪 Phase 2 Complete Testing Suite</CardTitle>
                <CardDescription>
                  Comprehensive testing for authentication, security, database integration, and system stability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuthenticationTester />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="navigation">
          <AuthNavigationTester />
        </TabsContent>
      </Tabs>

      {/* Quick Auth Links */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Authentication Access</CardTitle>
          <CardDescription>Direct links to authentication pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button asChild>
              <Link to="/login">Login Page</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/register">Register Page</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/forgot-password">Forgot Password</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/reset-password?token=test">Reset Password</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
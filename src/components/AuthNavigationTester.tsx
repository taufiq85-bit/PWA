import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function AuthNavigationTester() {
  const location = useLocation()
  
  const authRoutes = [
    { path: '/login', name: 'Login', description: 'User login form' },
    { path: '/register', name: 'Register', description: 'User registration' },
    { path: '/forgot-password', name: 'Forgot Password', description: 'Password recovery' },
    { path: '/reset-password?token=test', name: 'Reset Password', description: 'Password reset' }
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>🧪 Authentication Navigation Tester</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Current:</span>
          <Badge variant="secondary">{location.pathname}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {authRoutes.map((route) => (
            <div key={route.path} className="space-y-2">
              <h4 className="font-medium text-sm">{route.name}</h4>
              <p className="text-xs text-muted-foreground">{route.description}</p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={route.path}>Test {route.name}</Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
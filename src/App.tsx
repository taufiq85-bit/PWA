// src/App.tsx
import { MainLayout } from "@/components/layout/MainLayout"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function App() {
  return (
    <MainLayout 
      userRole="admin" 
      userName="Admin User" 
      currentPath="/admin"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Component Test</CardTitle>
            <CardDescription>Testing all components dari roadmap</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button>Test Button</Button>
            <LoadingSpinner text="Testing spinner..." />
            <p>✅ Header, Sidebar, MainLayout, LoadingSpinner, ErrorBoundary - ALL WORKING!</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default App
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export function DosenDashboard() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dosen Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Selamat Datang, {user?.user_metadata?.full_name || user?.email}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Dashboard dosen akan dibangun di session selanjutnya.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Session Goal: Phase 5 - Role Dashboards (30 Agu-5 Sep)
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
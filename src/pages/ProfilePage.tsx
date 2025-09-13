import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react'

export function ProfilePage() {
  const { user, currentRole } = useAuth()

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profil Pengguna</h1>
        <p className="text-muted-foreground">Kelola informasi profil Anda</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pribadi
            </CardTitle>
            <CardDescription>Data personal Anda di sistem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <p className="text-sm text-muted-foreground">
                {user?.user_metadata?.full_name || user?.email || 'Tidak tersedia'}
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Nomor Telepon
              </label>
              <p className="text-sm text-muted-foreground">
                {user?.user_metadata?.phone || 'Belum diisi'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Bergabung Sejak
              </label>
              <p className="text-sm text-muted-foreground">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : 'Tidak tersedia'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Role & Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role & Akses
            </CardTitle>
            <CardDescription>Peran dan hak akses Anda di sistem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role Aktif</label>
              <div>
                <Badge variant="secondary" className="capitalize">
                  {currentRole || 'Tidak ada role'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status Akun</label>
              <div>
                <Badge variant={user?.email_confirmed_at ? 'default' : 'destructive'}>
                  {user?.email_confirmed_at ? 'Terverifikasi' : 'Belum Verifikasi'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">NIM/NIP</label>
              <p className="text-sm text-muted-foreground">
                {user?.user_metadata?.nim_nip || 'Belum diisi'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Pengaturan Akun</CardTitle>
            <CardDescription>Kelola pengaturan akun Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline">Edit Profil</Button>
              <Button variant="outline">Ubah Password</Button>
              <Button variant="outline">Pengaturan Notifikasi</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
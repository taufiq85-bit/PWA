// src/components/ui/medical-theme-showcase.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, Activity, Shield, Users } from 'lucide-react'

export function MedicalThemeShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Medical Color Palette */}
      <Card className="theme-transition">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-medical-500" />
            AKBID Medical Palette
          </CardTitle>
          <CardDescription>Warna tema khusus Akademi Kebidanan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {[50, 100, 200, 300, 400, 500].map((shade) => (
              <div key={shade} className="space-y-1">
                <div
                  className={`h-12 w-full rounded-md bg-medical-${shade} border theme-transition`}
                  title={`medical-${shade}`}
                />
                <p className="text-xs text-center text-muted-foreground">
                  {shade}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Colors */}
      <Card className="theme-transition">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-info" />
            Status Colors
          </CardTitle>
          <CardDescription>Warna untuk notifikasi dan status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-success text-success-foreground">
              Success
            </Badge>
            <span className="text-sm text-muted-foreground">
              Berhasil / Selesai
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-warning text-warning-foreground">
              Warning
            </Badge>
            <span className="text-sm text-muted-foreground">Peringatan</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-info text-info-foreground">Info</Badge>
            <span className="text-sm text-muted-foreground">Informasi</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">Error</Badge>
            <span className="text-sm text-muted-foreground">Error / Gagal</span>
          </div>
        </CardContent>
      </Card>

      {/* Medical Components Demo */}
      <Card className="theme-transition md:col-span-2">
        <CardHeader>
          <CardTitle className="medical-text-gradient">
            Component Demo - AKBID Theme
          </CardTitle>
          <CardDescription>
            Contoh penggunaan komponen dengan tema medis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button className="medical-gradient">
              <Shield className="mr-2 h-4 w-4" />
              Primary Medical
            </Button>
            <Button
              variant="outline"
              className="border-medical-300 text-medical-600 hover:bg-medical-50 dark:border-medical-600 dark:text-medical-400 dark:hover:bg-medical-900"
            >
              <Users className="mr-2 h-4 w-4" />
              Outline Medical
            </Button>
          </div>

          <div className="p-4 bg-medical-50 dark:bg-medical-900/20 rounded-lg border border-medical-200 dark:border-medical-800">
            <p className="text-medical-800 dark:text-medical-200 text-sm">
              📋 Ini adalah contoh area konten dengan background medical theme
              yang konsisten dengan identitas AKBID Mega Buana.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

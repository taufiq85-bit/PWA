// src/components/ui/responsive-showcase.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Monitor, Smartphone, Tablet, Grid3x3, Layout, Eye } from 'lucide-react'

export function ResponsiveShowcase() {
  return (
    <div className="space-y-6">
      {/* Breakpoint Demonstration */}
      <Card className="theme-transition">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-medical-500" />
            Responsive Breakpoints
          </CardTitle>
          <CardDescription>
            Custom breakpoints untuk AKBID System (Tailwind 4.x)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid-responsive-cards">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border">
              <Smartphone className="h-6 w-6 text-red-500 mb-2" />
              <p className="font-medium text-red-800 dark:text-red-200">
                Mobile
              </p>
              <p className="text-sm text-red-600 dark:text-red-300">
                375px - 639px
              </p>
              <Badge className="mt-2 show-mobile bg-red-500">Visible Now</Badge>
              <Badge className="mt-2 hide-mobile bg-red-100 text-red-800">
                Hidden
              </Badge>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border">
              <Tablet className="h-6 w-6 text-yellow-500 mb-2" />
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Tablet
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-300">
                640px - 1023px
              </p>
              <Badge className="mt-2 show-tablet bg-yellow-500">
                Visible Now
              </Badge>
              <Badge className="mt-2 hidden tablet:hidden desktop-sm:block bg-yellow-100 text-yellow-800">
                Hidden
              </Badge>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border">
              <Monitor className="h-6 w-6 text-green-500 mb-2" />
              <p className="font-medium text-green-800 dark:text-green-200">
                Desktop
              </p>
              <p className="text-sm text-green-600 dark:text-green-300">
                1024px+
              </p>
              <Badge className="mt-2 show-desktop bg-green-500">
                Visible Now
              </Badge>
              <Badge className="mt-2 desktop-sm:hidden bg-green-100 text-green-800">
                Hidden
              </Badge>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
              <Layout className="h-6 w-6 text-blue-500 mb-2" />
              <p className="font-medium text-blue-800 dark:text-blue-200">
                Large Desktop
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                1536px+
              </p>
              <Badge className="mt-2 hidden desktop-lg:block bg-blue-500">
                Visible Now
              </Badge>
              <Badge className="mt-2 desktop-lg:hidden bg-blue-100 text-blue-800">
                Hidden
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid System Demo */}
      <Card className="theme-transition">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-medical-500" />
            Responsive Grid System
          </CardTitle>
          <CardDescription>
            Grid yang adaptive berdasarkan screen size
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Auto Grid */}
            <div>
              <h4 className="font-medium mb-2">
                Grid Responsive Auto (1→2→3→4 columns)
              </h4>
              <div className="grid-responsive-auto gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-medical-100 dark:bg-medical-800 p-3 rounded text-center text-medical-800 dark:text-medical-200"
                  >
                    Item {i}
                  </div>
                ))}
              </div>
            </div>

            {/* 2-4 Grid */}
            <div>
              <h4 className="font-medium mb-2">
                Grid 2-4 Columns (1→2→4 columns)
              </h4>
              <div className="grid-responsive-2-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-medical-200 dark:bg-medical-700 p-3 rounded text-center text-medical-900 dark:text-medical-100"
                  >
                    Card {i}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography & Spacing Demo */}
      <Card className="theme-transition">
        <CardHeader>
          <CardTitle>Responsive Typography & Spacing</CardTitle>
          <CardDescription>
            Typography dan spacing yang adaptive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-responsive">
          <div>
            <h1 className="medical-text-gradient">Responsive Heading H1</h1>
            <p className="text-responsive-base text-muted-foreground">
              Heading ini akan menyesuaikan ukuran: text-2xl → tablet:text-3xl →
              desktop:text-4xl
            </p>
          </div>

          <div>
            <h2>Responsive Heading H2</h2>
            <p className="text-responsive-sm text-muted-foreground">
              Typography system yang konsisten di semua device sizes
            </p>
          </div>

          <div>
            <h3>Responsive Heading H3</h3>
            <p className="text-responsive-xs text-muted-foreground">
              Dengan spacing yang juga responsive menggunakan space-y-responsive
            </p>
          </div>

          <div className="flex flex-wrap gap-responsive">
            <Button className="btn-responsive medical-gradient">
              Responsive Button
            </Button>
            <Button variant="outline" className="btn-responsive">
              Auto Sizing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visibility Demo */}
      <Card className="theme-transition">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-medical-500" />
            Responsive Visibility
          </CardTitle>
          <CardDescription>
            Components yang show/hide berdasarkan screen size
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-4 w-4" />
                <span className="font-medium">Mobile Only</span>
              </div>
              <div className="show-mobile">
                <Badge className="bg-medical-500">📱 Visible on Mobile</Badge>
              </div>
              <div className="hide-mobile">
                <Badge variant="outline">Hidden on Mobile</Badge>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Tablet className="h-4 w-4" />
                <span className="font-medium">Tablet Only</span>
              </div>
              <div className="show-tablet">
                <Badge className="bg-medical-500">📱 Visible on Tablet</Badge>
              </div>
              <div className="hidden tablet:hidden desktop-sm:block">
                <Badge variant="outline">Hidden on Tablet</Badge>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="h-4 w-4" />
                <span className="font-medium">Desktop Only</span>
              </div>
              <div className="show-desktop">
                <Badge className="bg-medical-500">🖥️ Visible on Desktop</Badge>
              </div>
              <div className="desktop-sm:hidden">
                <Badge variant="outline">Hidden on Desktop</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Navigation Demo */}
      <Card className="theme-transition tablet:hidden">
        <CardHeader>
          <CardTitle className="text-medical-600 dark:text-medical-400">
            📱 Mobile-Specific Content
          </CardTitle>
          <CardDescription>
            Card ini hanya visible di mobile (tablet:hidden)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Content khusus mobile seperti bottom navigation, mobile menu, atau
            mobile-specific features.
          </p>
          <Button size="sm" className="mt-3 w-full medical-gradient">
            Mobile Action Button
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

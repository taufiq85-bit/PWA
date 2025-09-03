// src/components/layout/ResponsiveLayout.tsx
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveLayoutProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean
}

export function ResponsiveLayout({
  children,
  className,
  maxWidth = '2xl',
  padding = true,
}: ResponsiveLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  }

  return (
    <div
      className={cn(
        'w-full mx-auto theme-transition',
        maxWidthClasses[maxWidth],
        padding && 'container-padding',
        className
      )}
    >
      {children}
    </div>
  )
}

// Responsive Container Components
export function MobileContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('tablet:hidden', className)}>{children}</div>
}

export function TabletContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('hidden tablet:block desktop-sm:hidden', className)}>
      {children}
    </div>
  )
}

export function DesktopContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('hidden desktop-sm:block', className)}>{children}</div>
  )
}

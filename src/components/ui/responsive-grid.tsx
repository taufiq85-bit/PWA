// src/components/ui/responsive-grid.tsx
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  gap?: 'sm' | 'md' | 'lg' | 'responsive'
  columns?: 'auto' | '2-4' | 'cards' | 'dashboard'
}

export function ResponsiveGrid({
  children,
  className,
  gap = 'responsive',
  columns = 'auto',
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    responsive: 'gap-responsive',
  }

  const columnClasses = {
    auto: 'grid-responsive-auto',
    '2-4': 'grid-responsive-2-4',
    cards: 'grid-responsive-cards',
    dashboard:
      'grid grid-cols-1 tablet:grid-cols-2 desktop-sm:grid-cols-3 desktop-lg:grid-cols-4',
  }

  return (
    <div className={cn(columnClasses[columns], gapClasses[gap], className)}>
      {children}
    </div>
  )
}

// Responsive Card Grid
export function ResponsiveCardGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('grid-responsive-cards', className)}>{children}</div>
  )
}

// Dashboard Grid
export function DashboardGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4',
        'tablet-sm:grid-cols-2 tablet-sm:gap-6',
        'desktop-sm:grid-cols-3',
        'desktop-lg:grid-cols-4',
        className
      )}
    >
      {children}
    </div>
  )
}

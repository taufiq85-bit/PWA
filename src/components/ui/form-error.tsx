// src/components/ui/form-error.tsx
import React from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface FormMessageProps {
  title?: string
  message?: string
  className?: string
}

export const FormError: React.FC<FormMessageProps> = ({
  title = 'Error',
  message,
  className,
}) => {
  if (!message) return null

  return (
    <Alert variant="destructive" className={cn('mb-4', className)}>
      <XCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export const FormSuccess: React.FC<FormMessageProps> = ({
  title,
  message,
  className,
}) => {
  if (!message) return null

  return (
    <Alert className={cn('mb-4 border-green-200 bg-green-50', className)}>
      <CheckCircle className="h-4 w-4 text-green-600" />
      {title && <AlertTitle className="text-green-800">{title}</AlertTitle>}
      <AlertDescription className="text-green-700">{message}</AlertDescription>
    </Alert>
  )
}

export const FormWarning: React.FC<FormMessageProps> = ({
  title = 'Peringatan',
  message,
  className,
}) => {
  if (!message) return null

  return (
    <Alert className={cn('mb-4 border-yellow-200 bg-yellow-50', className)}>
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">{title}</AlertTitle>
      <AlertDescription className="text-yellow-700">{message}</AlertDescription>
    </Alert>
  )
}

export const FormInfo: React.FC<FormMessageProps> = ({
  title = 'Informasi',
  message,
  className,
}) => {
  if (!message) return null

  return (
    <Alert className={cn('mb-4 border-blue-200 bg-blue-50', className)}>
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">{title}</AlertTitle>
      <AlertDescription className="text-blue-700">{message}</AlertDescription>
    </Alert>
  )
}

// src/components/forms/FormError.tsx
import React from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface FormErrorProps {
  title?: string
  message?: string
  errors?: Record<string, string[]>
}

export const FormError: React.FC<FormErrorProps> = ({
  title = 'Form Error',
  message,
  errors,
}) => {
  if (!message && !errors) return null

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {message && <p>{message}</p>}
        {errors && (
          <ul className="mt-2 list-disc list-inside">
            {Object.entries(errors).map(([field, messages]) => (
              <li key={field}>
                <strong>{field}:</strong> {messages.join(', ')}
              </li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  )
}

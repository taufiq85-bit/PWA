// src/components/forms/LoginForm.tsx
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations'
import { Form, FormField } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FormFieldComponent } from './FormField'
import { FormError } from './FormError'
import { Loader2, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const handleSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      await onSubmit(data)
    } catch (err: any) {
      setError(err.message || 'Login gagal. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Masuk ke Sistem Informasi Praktikum</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {error && <FormError message={error} />}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormFieldComponent
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="nama@email.com"
                  required
                  field={field}
                />
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormFieldComponent
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Masukkan password"
                  required
                  field={field}
                />
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormFieldComponent
                  name="rememberMe"
                  type="checkbox"
                  placeholder="Ingat saya"
                  field={field}
                />
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sedang masuk...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Masuk
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link
          to="/forgot-password"
          className="text-sm text-muted-foreground hover:underline"
        >
          Lupa password?
        </Link>
        <Link
          to="/register"
          className="text-sm text-muted-foreground hover:underline"
        >
          Belum punya akun?
        </Link>
      </CardFooter>
    </Card>
  )
}

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { Checkbox } from '../ui/checkbox'

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(255, 'Email terlalu panjang'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(6, 'Password minimal 6 karakter')
    .max(100, 'Password terlalu panjang'),
  rememberMe: z.boolean().optional()
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSuccess?: () => void
  onForgotPassword?: () => void
  redirectTo?: string
  className?: string
}

export function LoginForm({ 
  onSuccess, 
  onForgotPassword, 
  redirectTo = '/dashboard',
  className = '' 
}: LoginFormProps) {
  const { login, loading, error, clearError } = useAuthContext()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setError,
    clearErrors
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })

  // Watch fields for real-time validation feedback
  const watchedEmail = watch('email')
  const watchedPassword = watch('password')

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true)
      clearError()
      clearErrors()

      console.log('Attempting login with:', { email: data.email, rememberMe: data.rememberMe })

      const result = await login({
        email: data.email,
        password: data.password,
        remember_me: data.rememberMe
      })

      if (result.success) {
        console.log('Login successful')
        onSuccess?.()
        
        // Redirect after successful login
        if (redirectTo) {
          window.location.href = redirectTo
        }
      } else {
        console.error('Login failed:', result.error)
        
        // Set specific field errors based on error type
        if (result.error?.includes('Invalid login credentials')) {
          setError('email', { message: 'Email atau password salah' })
          setError('password', { message: 'Email atau password salah' })
        } else if (result.error?.includes('Email not confirmed')) {
          setError('email', { message: 'Email belum dikonfirmasi. Periksa email Anda.' })
        } else {
          setError('root', { message: result.error || 'Login gagal' })
        }
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError('root', { message: err.message || 'Terjadi kesalahan saat login' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = () => {
    clearError()
    clearErrors()
    onForgotPassword?.()
  }

  const isFormLoading = loading || isSubmitting

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
              disabled={isFormLoading}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
          {/* Real-time validation feedback */}
          {watchedEmail && !errors.email && watchedEmail.includes('@') && (
            <p className="text-sm text-green-600">Format email valid</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
              disabled={isFormLoading}
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isFormLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
          {/* Password strength indicator */}
          {watchedPassword && !errors.password && (
            <div className="text-xs text-muted-foreground">
              Password strength: {watchedPassword.length >= 8 ? 'Strong' : 'Weak'}
            </div>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="rememberMe" 
            disabled={isFormLoading}
            {...register('rememberMe')}
          />
          <Label 
            htmlFor="rememberMe" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember me for 30 days
          </Label>
        </div>

        {/* Error Display */}
        {(error || errors.root) && (
          <Alert variant="destructive">
            <AlertDescription>
              {error || errors.root?.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isFormLoading || !isValid}
        >
          {isFormLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>

        {/* Forgot Password Link */}
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={handleForgotPassword}
            disabled={isFormLoading}
          >
            Forgot your password?
          </button>
        </div>
      </form>

      {/* Development Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-3 bg-muted rounded text-xs">
          <p>Debug Info:</p>
          <p>Form Valid: {isValid ? 'Yes' : 'No'}</p>
          <p>Loading: {isFormLoading ? 'Yes' : 'No'}</p>
          <p>Errors: {Object.keys(errors).length}</p>
        </div>
      )}
    </div>
  )
}
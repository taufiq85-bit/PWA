import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'

// Validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(255, 'Email terlalu panjang'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordFormProps {
  onBackToLogin?: () => void
  onSuccess?: (email: string) => void
  className?: string
}

export function ForgotPasswordForm({
  onBackToLogin,
  onSuccess,
  className = '',
}: ForgotPasswordFormProps) {
  const { resetPassword, loading, error, clearError } = useAuthContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState('')
  const [requestSuccess, setRequestSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setError,
    clearErrors,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  })

  const watchedEmail = watch('email')

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsSubmitting(true)
      clearError()
      clearErrors()

      console.log('Requesting password reset for:', data.email)

      const result = await resetPassword(data.email)

      if (result.success) {
        console.log('Password reset email sent successfully')
        setEmailSent(data.email)
        setRequestSuccess(true)
        onSuccess?.(data.email)
      } else {
        console.error('Password reset failed:', result.error)

        // Set specific field errors based on error type
        if (
          result.error?.includes('User not found') ||
          result.error?.includes('Invalid email')
        ) {
          setError('email', { message: 'Email tidak terdaftar dalam sistem' })
        } else if (result.error?.includes('Too many requests')) {
          setError('email', {
            message:
              'Terlalu banyak permintaan. Coba lagi dalam beberapa menit.',
          })
        } else {
          setError('root', {
            message: result.error || 'Gagal mengirim email reset password',
          })
        }
      }
    } catch (err: unknown) {
  console.error('Password reset error:', err)
  const errorMessage = err instanceof Error 
    ? err.message 
    : typeof err === 'string' 
      ? err 
      : 'Terjadi kesalahan saat mengirim email reset'
  
  setError('root', {
    message: errorMessage,
  })
} finally {
      setIsSubmitting(false)
    }
  }

  const isFormLoading = loading || isSubmitting

  // Show success state
  if (requestSuccess) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <Card>
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-700">
                Email Terkirim!
              </h2>
              <p className="text-gray-600 mt-2">
                Instruksi reset password telah dikirim ke:
              </p>
              <p className="font-medium text-blue-600">{emailSent}</p>
            </div>
            <Alert>
              <AlertDescription>
                Silakan periksa email Anda dan klik link reset password. Link
                akan kedaluwarsa dalam 1 jam. Periksa juga folder spam jika
                email tidak ditemukan.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button onClick={onBackToLogin} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Login
              </Button>
              <Button
                onClick={() => {
                  setRequestSuccess(false)
                  setEmailSent('')
                }}
                variant="outline"
                className="w-full"
              >
                Kirim Ulang
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Lupa Password?</CardTitle>
          <CardDescription>
            Masukkan email Anda untuk menerima instruksi reset password
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  placeholder="nama@akbidmegabuana.ac.id"
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                  disabled={isFormLoading}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
              {watchedEmail && !errors.email && watchedEmail.includes('@') && (
                <p className="text-sm text-green-600">Format email valid</p>
              )}
            </div>

            {/* Error Display */}
            {(error || errors.root) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error || errors.root?.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Info Alert */}
            <Alert>
              <AlertDescription>
                Kami akan mengirim link reset password ke email Anda. Link akan
                kedaluwarsa dalam 1 jam.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isFormLoading || !isValid}
            >
              {isFormLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim email...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Kirim Link Reset
                </>
              )}
            </Button>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
                onClick={onBackToLogin}
                disabled={isFormLoading}
              >
                <ArrowLeft className="h-3 w-3" />
                Kembali ke Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Development Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-muted rounded text-xs">
          <p>Debug Info:</p>
          <p>Form Valid: {isValid ? 'Yes' : 'No'}</p>
          <p>Loading: {isFormLoading ? 'Yes' : 'No'}</p>
          <p>Email: {watchedEmail}</p>
        </div>
      )}
    </div>
  )
}

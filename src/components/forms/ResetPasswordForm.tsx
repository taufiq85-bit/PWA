import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye,
  EyeOff,
  Lock,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
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
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password wajib diisi')
      .min(8, 'Password minimal 8 karakter')
      .max(100, 'Password terlalu panjang')
      .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
      .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
      .regex(/[0-9]/, 'Password harus mengandung angka'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password tidak sama',
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

interface ResetPasswordFormProps {
  accessToken?: string // From URL params
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
}

export function ResetPasswordForm({
  accessToken,
  onSuccess,
  onError,
  className = '',
}: ResetPasswordFormProps) {
  const { updatePassword, loading, error, clearError } = useAuthContext()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setError,
    clearErrors,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const watchedPassword = watch('password')

  // Check token validity on mount
  useEffect(() => {
    const checkToken = async () => {
      if (!accessToken) {
        setTokenValid(false)
        onError?.('Token reset password tidak ditemukan')
        return
      }

      try {
        // Validate token with Supabase
        // In a real implementation, you might want to verify the token
        setTokenValid(true)
      } catch (err) {
        setTokenValid(false)
        onError?.('Token reset password tidak valid atau sudah kedaluwarsa')
      }
    }

    checkToken()
  }, [accessToken, onError])

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    if (!password)
      return { score: 0, label: 'Sangat Lemah', color: 'bg-gray-300' }

    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    const levels = [
      { score: 0, label: 'Sangat Lemah', color: 'bg-red-500' },
      { score: 1, label: 'Lemah', color: 'bg-red-400' },
      { score: 2, label: 'Cukup', color: 'bg-yellow-500' },
      { score: 3, label: 'Kuat', color: 'bg-blue-500' },
      { score: 4, label: 'Sangat Kuat', color: 'bg-green-500' },
    ]

    return levels[Math.min(score, 4)]
  }

  const passwordStrength = getPasswordStrength(watchedPassword)

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsSubmitting(true)
      clearError()
      clearErrors()

      console.log('Updating password with new credentials')

      const result = await updatePassword(data.password)

      if (result.success) {
        console.log('Password reset successful')
        setResetSuccess(true)
        onSuccess?.()
      } else {
        console.error('Password reset failed:', result.error)

        // Set specific field errors based on error type
        if (result.error?.includes('weak password')) {
          setError('password', {
            message:
              'Password terlalu lemah. Gunakan kombinasi huruf besar, kecil, dan angka.',
          })
        } else if (result.error?.includes('same password')) {
          setError('password', {
            message: 'Password baru tidak boleh sama dengan password lama.',
          })
        } else {
          setError('root', {
            message: result.error || 'Gagal mengubah password',
          })
        }
      }
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError('root', {
        message: err.message || 'Terjadi kesalahan saat mengubah password',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormLoading = loading || isSubmitting

  // Show success state
  if (resetSuccess) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <Card>
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-700">
                Password Berhasil Diubah!
              </h2>
              <p className="text-gray-600 mt-2">
                Password Anda telah berhasil diperbarui. Sekarang Anda dapat
                login dengan password baru.
              </p>
            </div>
            <Button
              onClick={() => (window.location.href = '/login')}
              className="w-full"
            >
              Login Sekarang
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show token validation loading
  if (tokenValid === null) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p>Memvalidasi token reset password...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show invalid token state
  if (tokenValid === false) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <Card>
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-700">
                Token Tidak Valid
              </h2>
              <p className="text-gray-600 mt-2">
                Link reset password tidak valid atau sudah kedaluwarsa. Silakan
                minta reset password baru.
              </p>
            </div>
            <Button
              onClick={() => (window.location.href = '/forgot-password')}
              className="w-full"
            >
              Reset Password Baru
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Masukkan password baru untuk akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password Baru
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}

              {/* Password Strength Indicator */}
              {watchedPassword && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{
                          width: `${(passwordStrength.score + 1) * 20}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Password harus mengandung:</p>
                    <ul className="list-disc list-inside ml-2 space-y-0.5">
                      <li
                        className={
                          /[A-Z]/.test(watchedPassword) ? 'text-green-600' : ''
                        }
                      >
                        Huruf besar (A-Z)
                      </li>
                      <li
                        className={
                          /[a-z]/.test(watchedPassword) ? 'text-green-600' : ''
                        }
                      >
                        Huruf kecil (a-z)
                      </li>
                      <li
                        className={
                          /[0-9]/.test(watchedPassword) ? 'text-green-600' : ''
                        }
                      >
                        Angka (0-9)
                      </li>
                      <li
                        className={
                          watchedPassword.length >= 8 ? 'text-green-600' : ''
                        }
                      >
                        Minimal 8 karakter
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Konfirmasi Password Baru
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ulangi password baru"
                  className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  disabled={isFormLoading}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isFormLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
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

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isFormLoading || !isValid}
            >
              {isFormLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengubah password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Ubah Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Development Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-muted rounded text-xs">
          <p>Debug Info:</p>
          <p>Form Valid: {isValid ? 'Yes' : 'No'}</p>
          <p>Loading: {isFormLoading ? 'Yes' : 'No'}</p>
          <p>Token Valid: {tokenValid ? 'Yes' : 'No'}</p>
          <p>Password Strength: {passwordStrength.label}</p>
        </div>
      )}
    </div>
  )
}

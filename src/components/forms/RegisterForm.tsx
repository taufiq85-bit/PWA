import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Checkbox } from '../ui/checkbox'

// Comprehensive validation schema
const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid')
      .max(255, 'Email terlalu panjang')
      .refine(
        (email) =>
          email.endsWith('@akbidmegabuana.ac.id') ||
          email.endsWith('@gmail.com'),
        'Email harus menggunakan domain @akbidmegabuana.ac.id atau @gmail.com'
      ),
    password: z
      .string()
      .min(1, 'Password wajib diisi')
      .min(8, 'Password minimal 8 karakter')
      .max(100, 'Password terlalu panjang')
      .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
      .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
      .regex(/[0-9]/, 'Password harus mengandung angka'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
    fullName: z
      .string()
      .min(1, 'Nama lengkap wajib diisi')
      .min(3, 'Nama minimal 3 karakter')
      .max(100, 'Nama terlalu panjang')
      .regex(/^[a-zA-Z\s]+$/, 'Nama hanya boleh mengandung huruf dan spasi'),
    phone: z
      .string()
      .optional()
      .refine(
        (phone) => !phone || /^(\+62|62|0)[0-9]{9,13}$/.test(phone),
        'Format nomor HP tidak valid (contoh: 081234567890)'
      ),
    role: z.enum(['MAHASISWA', 'DOSEN', 'LABORAN'] as const, {
      message: 'Role wajib dipilih',
    }),
    nim: z
      .string()
      .optional()
      .refine(
        (nim) => !nim || /^[0-9]{8,12}$/.test(nim),
        'NIM harus 8-12 digit angka'
      ),
    nip: z
      .string()
      .optional()
      .refine(
        (nip) => !nip || /^[0-9]{8,18}$/.test(nip),
        'NIP harus 8-18 digit angka'
      ),
    agreeToTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        'Anda harus menyetujui syarat dan ketentuan'
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password tidak sama',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.role === 'MAHASISWA' && !data.nim) {
        return false
      }
      if ((data.role === 'DOSEN' || data.role === 'LABORAN') && !data.nip) {
        return false
      }
      return true
    },
    {
      message: 'NIM wajib untuk mahasiswa, NIP wajib untuk dosen/laboran',
      path: ['nim'],
    }
  )

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSuccess?: () => void
  onLoginRedirect?: () => void
  className?: string
}

export function RegisterForm({
  onSuccess,
  onLoginRedirect,
  className = '',
}: RegisterFormProps) {
  const {
    register: registerUser,
    loading,
    error,
    clearError,
  } = useAuthContext()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [emailSent, setEmailSent] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setError,
    clearErrors,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
      role: undefined,
      nim: '',
      nip: '',
      agreeToTerms: false,
    },
  })

  // Watch fields for dynamic validation and conditional rendering
  const watchedRole = watch('role')
  const watchedPassword = watch('password')
  const watchedEmail = watch('email')

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

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true)
      clearError()
      clearErrors()

      console.log('Attempting registration with:', {
        email: data.email,
        role: data.role,
        fullName: data.fullName,
      })

      const result = await registerUser({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role,
        nim: data.nim,
        nip: data.nip,
      })

      if (result.success) {
        console.log('Registration successful')
        setRegistrationSuccess(true)
        setEmailSent(data.email)
        onSuccess?.()
      } else {
        console.error('Registration failed:', result.error)

        // Set specific field errors based on error type
        if (result.error?.includes('Email already registered')) {
          setError('email', {
            message:
              'Email sudah terdaftar. Silakan login atau gunakan email lain.',
          })
        } else if (result.error?.includes('weak password')) {
          setError('password', {
            message:
              'Password terlalu lemah. Gunakan kombinasi huruf besar, kecil, dan angka.',
          })
        } else {
          setError('root', { message: result.error || 'Registrasi gagal' })
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setError('root', {
        message: err.message || 'Terjadi kesalahan saat registrasi',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRoleChange = (value: string) => {
    setValue('role', value as 'MAHASISWA' | 'DOSEN' | 'LABORAN')

    // Clear NIM/NIP when role changes
    setValue('nim', '')
    setValue('nip', '')
    clearErrors(['nim', 'nip'])
  }

  const isFormLoading = loading || isSubmitting

  // Show success state
  if (registrationSuccess) {
    return (
      <div
        className={`w-full max-w-md mx-auto text-center space-y-6 ${className}`}
      >
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-green-700">
            Registrasi Berhasil!
          </h2>
          <p className="text-gray-600 mt-2">
            Email verifikasi telah dikirim ke:
          </p>
          <p className="font-medium text-blue-600">{emailSent}</p>
        </div>
        <Alert>
          <AlertDescription>
            Silakan periksa email Anda dan klik link verifikasi untuk
            mengaktifkan akun. Periksa juga folder spam jika email tidak
            ditemukan di inbox.
          </AlertDescription>
        </Alert>
        <Button onClick={onLoginRedirect} className="w-full">
          Kembali ke Login
        </Button>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address *
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
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
          {watchedEmail && !errors.email && watchedEmail.includes('@') && (
            <p className="text-sm text-green-600">Format email valid</p>
          )}
        </div>

        {/* Full Name Field */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium">
            Nama Lengkap *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="fullName"
              type="text"
              placeholder="Masukkan nama lengkap"
              className={`pl-10 ${errors.fullName ? 'border-destructive' : ''}`}
              disabled={isFormLoading}
              {...register('fullName')}
            />
          </div>
          {errors.fullName && (
            <p className="text-sm text-destructive">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium">
            Role *
          </Label>
          <Select onValueChange={handleRoleChange} disabled={isFormLoading}>
            <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
              <SelectValue placeholder="Pilih role Anda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MAHASISWA">Mahasiswa</SelectItem>
              <SelectItem value="DOSEN">Dosen</SelectItem>
              <SelectItem value="LABORAN">Laboran</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-destructive">{errors.role.message}</p>
          )}
        </div>

        {/* Conditional NIM/NIP Field */}
        {watchedRole && (
          <div className="space-y-2">
            <Label
              htmlFor={watchedRole === 'MAHASISWA' ? 'nim' : 'nip'}
              className="text-sm font-medium"
            >
              {watchedRole === 'MAHASISWA' ? 'NIM *' : 'NIP *'}
            </Label>
            <Input
              id={watchedRole === 'MAHASISWA' ? 'nim' : 'nip'}
              type="text"
              placeholder={
                watchedRole === 'MAHASISWA' ? 'Masukkan NIM' : 'Masukkan NIP'
              }
              className={errors.nim || errors.nip ? 'border-destructive' : ''}
              disabled={isFormLoading}
              {...register(watchedRole === 'MAHASISWA' ? 'nim' : 'nip')}
            />
            {(errors.nim || errors.nip) && (
              <p className="text-sm text-destructive">
                {errors.nim?.message || errors.nip?.message}
              </p>
            )}
          </div>
        )}

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Nomor HP (Opsional)
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="081234567890"
              className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
              disabled={isFormLoading}
              {...register('phone')}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password *
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
                    style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
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
            Konfirmasi Password *
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Ulangi password"
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

        {/* Terms Agreement */}
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreeToTerms"
              disabled={isFormLoading}
              {...register('agreeToTerms')}
            />
            <Label
              htmlFor="agreeToTerms"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Saya menyetujui{' '}
              <a
                href="/terms"
                className="text-primary hover:underline"
                target="_blank"
              >
                Syarat dan Ketentuan
              </a>{' '}
              serta{' '}
              <a
                href="/privacy"
                className="text-primary hover:underline"
                target="_blank"
              >
                Kebijakan Privasi
              </a>
            </Label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm text-destructive">
              {errors.agreeToTerms.message}
            </p>
          )}
        </div>

        {/* Error Display */}
        {(error || errors.root) && (
          <Alert variant="destructive">
            <AlertDescription>{error || errors.root?.message}</AlertDescription>
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
              Membuat akun...
            </>
          ) : (
            'Daftar Sekarang'
          )}
        </Button>

        {/* Login Redirect */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Sudah punya akun?{' '}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={onLoginRedirect}
              disabled={isFormLoading}
            >
              Masuk di sini
            </button>
          </p>
        </div>
      </form>

      {/* Development Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-3 bg-muted rounded text-xs">
          <p>Debug Info:</p>
          <p>Form Valid: {isValid ? 'Yes' : 'No'}</p>
          <p>Loading: {isFormLoading ? 'Yes' : 'No'}</p>
          <p>Selected Role: {watchedRole || 'None'}</p>
          <p>Errors: {Object.keys(errors).length}</p>
        </div>
      )}
    </div>
  )
}

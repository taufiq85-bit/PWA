import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Phone, Loader2, Camera } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

// ProfileForm validation schema
const profileSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Nama lengkap wajib diisi')
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama terlalu panjang'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  phone: z
    .string()
    .optional()
    .refine(
      (phone) => !phone || /^(\+62|62|0)[0-9]{9,13}$/.test(phone),
      'Format nomor HP tidak valid'
    ),
  nim_nip: z.string().optional(),
  address: z.string().optional(),
  avatar_url: z.string().optional(),  // ✅ ADDED
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>
  onSubmit?: (data: ProfileFormData) => Promise<{ success: boolean; error?: string }>
  onAvatarChange?: (file: File) => Promise<string>
  onCancel?: () => void
  className?: string
}

export function ProfileForm({
  initialData,
  onSubmit,
  onAvatarChange,
  onCancel,
  className = '',
}: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || '')
  const [avatarUploading, setAvatarUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
  full_name: initialData?.full_name || '',
  email: initialData?.email || '',
  phone: initialData?.phone || '',
  nim_nip: initialData?.nim_nip || '',
  address: initialData?.address || '',
  avatar_url: initialData?.avatar_url || '',  // ✅ ADDED
},
  })

  const handleFormSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true)
      setSubmitError('')
      setSuccessMessage('')

      if (onSubmit) {
        const result = await onSubmit(data)
        if (result.success) {
          setSuccessMessage('Profile berhasil diperbarui!')
          reset(data) // Reset form with new data
        } else {
          setSubmitError(result.error || 'Gagal memperbarui profile')
        }
      } else {
        // Mock success for testing
        console.log('Profile update data:', data)
        setSuccessMessage('Profile berhasil diperbarui!')
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setAvatarUploading(true)
      
      if (onAvatarChange) {
        const newAvatarUrl = await onAvatarChange(file)
        setAvatarUrl(newAvatarUrl)
      } else {
        // Mock avatar upload
        const mockUrl = URL.createObjectURL(file)
        setAvatarUrl(mockUrl)
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Gagal upload avatar')
    } finally {
      setAvatarUploading(false)
    }
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt="Profile" />
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={avatarUploading}
            />
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              onClick={() => document.getElementById('avatar-upload')?.click()}
              disabled={avatarUploading}
            >
              {avatarUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Klik ikon kamera untuk mengubah foto profil
          </p>
        </div>

        {/* Full Name Field */}
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-sm font-medium">
            Nama Lengkap *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="full_name"
              type="text"
              placeholder="Masukkan nama lengkap"
              className={`pl-10 ${errors.full_name ? 'border-destructive' : ''}`}
              disabled={isSubmitting}
              {...register('full_name')}
            />
          </div>
          {errors.full_name && (
            <p className="text-sm text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        {/* Email Field (Read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            className="bg-muted"
            disabled
            {...register('email')}
          />
          <p className="text-xs text-muted-foreground">
            Email tidak dapat diubah
          </p>
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Nomor HP
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="081234567890"
              className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
              disabled={isSubmitting}
              {...register('phone')}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* NIM/NIP Field */}
        <div className="space-y-2">
          <Label htmlFor="nim_nip" className="text-sm font-medium">
            NIM/NIP
          </Label>
          <Input
            id="nim_nip"
            type="text"
            placeholder="Masukkan NIM atau NIP"
            className={errors.nim_nip ? 'border-destructive' : ''}
            disabled={isSubmitting}
            {...register('nim_nip')}
          />
          {errors.nim_nip && (
            <p className="text-sm text-destructive">{errors.nim_nip.message}</p>
          )}
        </div>

        {/* Address Field */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Alamat
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="Masukkan alamat"
            disabled={isSubmitting}
            {...register('address')}
          />
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert>
            <AlertDescription className="text-green-600">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Batal
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
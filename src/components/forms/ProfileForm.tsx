// src/components/forms/ProfileForm.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().optional(),
  nim_nip: z.string().optional(),
  address: z.string().optional(),
})

type ProfileData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  defaultValues?: Partial<ProfileData>
  onSubmit: (data: ProfileData) => Promise<{ success: boolean; error?: string }>
  onCancel?: () => void
  isLoading?: boolean
}

// EXPORT FUNCTION YANG BENAR
export function ProfileForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: ProfileFormProps) {
  const [submitError, setSubmitError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  })

  const handleFormSubmit = async (data: ProfileData) => {
    try {
      setSubmitError('')
      const result = await onSubmit(data)

      if (!result.success && result.error) {
        setSubmitError(result.error)
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Terjadi kesalahan')
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="full_name">Nama Lengkap</Label>
        <Input
          id="full_name"
          {...register('full_name')}
          placeholder="Masukkan nama lengkap"
        />
        {errors.full_name && (
          <p className="text-sm text-red-600">{errors.full_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="Masukkan email"
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telepon (Opsional)</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="Masukkan nomor telepon"
        />
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nim_nip">NIM/NIP (Opsional)</Label>
        <Input
          id="nim_nip"
          {...register('nim_nip')}
          placeholder="Masukkan NIM/NIP"
        />
        {errors.nim_nip && (
          <p className="text-sm text-red-600">{errors.nim_nip.message}</p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="flex-1"
        >
          {isSubmitting || isLoading ? 'Menyimpan...' : 'Simpan'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            Batal
          </Button>
        )}
      </div>
    </form>
  )
}

// JUGA TAMBAHKAN DEFAULT EXPORT
export default ProfileForm

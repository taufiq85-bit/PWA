// src/components/forms/ProfileForm.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileFormData } from '@/lib/validations'
import {
  BaseForm,
  FormInput,
  FormSubmitButton,
} from '@/components/ui/BaseFormComponents'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FormSuccess } from '@/components/ui/form-error'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { User, Camera, Save } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>
  onSubmit?: (data: ProfileFormData) => Promise<void>
  onAvatarChange?: (file: File) => Promise<string>
  className?: string
}

export function ProfileForm({
  initialData,
  onSubmit,
  onAvatarChange,
  className,
}: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData?.name || '',
      nim: initialData?.nim || '',
      phone: initialData?.phone || '',
    },
  })

  const handleSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setSuccessMessage('')

    try {
      const submitData = { ...data, avatar_url: avatarUrl }
      if (onSubmit) {
        await onSubmit(submitData)
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))
        console.log('Profile data:', submitData)
      }

      setSuccessMessage('Profil berhasil diperbarui!')
    } catch (error) {
      console.error('Profile update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      if (onAvatarChange) {
        const newUrl = await onAvatarChange(file)
        setAvatarUrl(newUrl)
      } else {
        // Preview only
        const url = URL.createObjectURL(file)
        setAvatarUrl(url)
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl">Profil Pengguna</CardTitle>
        <CardDescription>
          Kelola informasi profil dan data pribadi Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BaseForm form={form} onSubmit={handleSubmit} className="space-y-6">
          <FormSuccess message={successMessage} />

          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt={form.getValues('name')} />
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  document.getElementById('avatar-upload')?.click()
                }
              >
                <Camera className="mr-2 h-4 w-4" />
                Ganti Foto
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Format: JPG, PNG. Maksimal 2MB
              </p>
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informasi Pribadi</h3>

            <FormInput
              form={form}
              name="name"
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              required
            />

            <FormInput
              form={form}
              name="email"
              label="Email"
              placeholder="nama@akbidmegabuana.ac.id"
              type="email"
              required
              disabled={true} // Email usually can't be changed
              description="Email tidak dapat diubah"
            />

            <FormInput
              form={form}
              name="nim"
              label="NIM"
              placeholder="Nomor Induk Mahasiswa"
              description="Kosongkan jika bukan mahasiswa"
            />

            <FormInput
              form={form}
              name="phone"
              label="Nomor Telepon"
              placeholder="+62812345678901"
              type="tel"
            />
          </div>

          <FormSubmitButton loading={isLoading} className="w-full">
            {isLoading ? (
              'Menyimpan perubahan...'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan Perubahan
              </>
            )}
          </FormSubmitButton>
        </BaseForm>
      </CardContent>
    </Card>
  )
}

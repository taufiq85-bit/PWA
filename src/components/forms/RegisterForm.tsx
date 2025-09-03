// src/components/forms/UserRegistrationForm.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type UserRegistrationInput } from '@/lib/validations'
import {
  BaseForm,
  FormInput,
  FormSelect,
  FormCheckbox,
  FormSubmitButton,
} from './../ui/BaseFormComponents'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FormSuccess } from '@/components/ui/form-error'
import { useNotification } from '@/context/NotificationContext'
import { Separator } from '@/components/ui/separator'

interface UserRegistrationFormProps {
  onSubmit?: (data: UserRegistrationInput) => Promise<void>
  className?: string
}

export function UserRegistrationForm({
  onSubmit,
  className,
}: UserRegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const { showError, showSuccess } = useNotification()

  const form = useForm<UserRegistrationInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
      role: undefined,
      nim: '',
      nip: '',
      department: '',
      agreeToTerms: false,
    },
    mode: 'onChange', // Real-time validation
  })

  const selectedRole = form.watch('role')

  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'dosen', label: 'Dosen' },
    { value: 'mahasiswa', label: 'Mahasiswa' },
    { value: 'laboran', label: 'Laboran' },
  ]

  const departmentOptions = [
    { value: 'kebidanan', label: 'Kebidanan' },
    { value: 'keperawatan', label: 'Keperawatan' },
    { value: 'kesehatan_masyarakat', label: 'Kesehatan Masyarakat' },
    { value: 'gizi', label: 'Gizi' },
  ]

  const handleSubmit = async (data: UserRegistrationInput) => {
    setIsLoading(true)
    setSuccessMessage('')

    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))
        console.log('Registration data:', data)
      }

      setSuccessMessage(
        'Pendaftaran berhasil! Silakan periksa email untuk verifikasi.'
      )
      showSuccess(
        'Pendaftaran Berhasil',
        'Akun telah dibuat, periksa email untuk aktivasi'
      )

      // Reset form after successful submission
      form.reset()
    } catch (error) {
      showError(
        'Pendaftaran Gagal',
        error instanceof Error ? error.message : 'Terjadi kesalahan'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl medical-text-gradient">
          Daftar Akun Baru
        </CardTitle>
        <CardDescription>
          Lengkapi formulir di bawah untuk mendaftar ke SI Praktikum AKBID
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BaseForm
          form={form}
          onSubmit={handleSubmit}
          showErrorSummary={true}
          className="space-y-4"
        >
          <FormSuccess message={successMessage} />

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informasi Pribadi</h3>

            <FormInput
              form={form}
              name="fullName"
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
              description="Gunakan email institusi resmi"
            />

            <FormInput
              form={form}
              name="phone"
              label="Nomor Telepon"
              placeholder="+62812345678901"
              type="tel"
              required
            />

            <FormSelect
              form={form}
              name="role"
              label="Role"
              placeholder="Pilih role Anda"
              options={roleOptions}
              required
            />
          </div>

          <Separator />

          {/* Role-specific Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informasi Role</h3>

            {selectedRole === 'mahasiswa' && (
              <FormInput
                form={form}
                name="nim"
                label="NIM"
                placeholder="12345678"
                required
                description="Nomor Induk Mahasiswa (8-12 digit)"
              />
            )}

            {selectedRole === 'dosen' && (
              <FormInput
                form={form}
                name="nip"
                label="NIP"
                placeholder="123456789012345678"
                required
                description="Nomor Induk Pegawai (18 digit)"
              />
            )}

            {(selectedRole === 'dosen' || selectedRole === 'admin') && (
              <FormSelect
                form={form}
                name="department"
                label="Departemen"
                placeholder="Pilih departemen"
                options={departmentOptions}
              />
            )}
          </div>

          <Separator />

          {/* Security Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Keamanan Akun</h3>

            <FormInput
              form={form}
              name="password"
              label="Password"
              placeholder="Masukkan password"
              type="password"
              required
              description="Minimal 8 karakter, kombinasi huruf, angka, dan simbol"
            />

            <FormInput
              form={form}
              name="confirmPassword"
              label="Konfirmasi Password"
              placeholder="Masukkan ulang password"
              type="password"
              required
            />
          </div>

          <Separator />

          {/* Terms and Conditions */}
          <FormCheckbox
            form={form}
            name="agreeToTerms"
            label="Saya menyetujui Syarat dan Ketentuan serta Kebijakan Privasi"
            description="Dengan mendaftar, Anda menyetujui penggunaan data sesuai kebijakan yang berlaku"
          />

          <FormSubmitButton
            loading={isLoading}
            disabled={!form.formState.isValid}
            className="w-full"
          >
            {isLoading ? 'Memproses Pendaftaran...' : 'Daftar Akun'}
          </FormSubmitButton>
        </BaseForm>
      </CardContent>
    </Card>
  )
}
export { UserRegistrationForm as RegisterForm }

// src/components/forms/ChangePasswordForm.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/lib/validations'
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
import { Lock, Shield, CheckCircle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ChangePasswordFormProps {
  onSubmit?: (data: ChangePasswordFormData) => Promise<void>
  className?: string
}

export function ChangePasswordForm({
  onSubmit,
  className,
}: ChangePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  })

  const handleSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true)
    setSuccessMessage('')

    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))
        console.log('Change password data:', data)
      }

      setSuccessMessage(
        'Password berhasil diubah! Gunakan password baru untuk login selanjutnya.'
      )
      form.reset()
    } catch (error) {
      console.error('Change password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Ubah Password
        </CardTitle>
        <CardDescription>
          Perbarui password akun Anda secara berkala untuk keamanan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BaseForm
          form={form}
          onSubmit={handleSubmit}
          showErrorSummary={true}
          className="space-y-6"
        >
          <FormSuccess message={successMessage} />

          {/* Security Tips */}
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              <strong>Tips Keamanan Password:</strong>
              <ul className="mt-2 list-disc list-inside text-sm">
                <li>Gunakan minimal 8 karakter</li>
                <li>Kombinasikan huruf besar, huruf kecil, dan angka</li>
                <li>Hindari informasi pribadi yang mudah ditebak</li>
                <li>Ganti password secara berkala</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Separator />

          {/* Password Fields */}
          <div className="space-y-4">
            <FormInput
              form={form}
              name="currentPassword"
              label="Password Saat Ini"
              placeholder="Masukkan password saat ini"
              type="password"
              required
            />

            <FormInput
              form={form}
              name="newPassword"
              label="Password Baru"
              placeholder="Masukkan password baru"
              type="password"
              required
              description="Minimal 8 karakter dengan kombinasi huruf dan angka"
            />

            <FormInput
              form={form}
              name="confirmPassword"
              label="Konfirmasi Password Baru"
              placeholder="Masukkan ulang password baru"
              type="password"
              required
            />
          </div>

          <FormSubmitButton
            loading={isLoading}
            disabled={!form.formState.isValid}
            className="w-full"
          >
            {isLoading ? (
              'Mengubah password...'
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Ubah Password
              </>
            )}
          </FormSubmitButton>
        </BaseForm>
      </CardContent>
    </Card>
  )
}

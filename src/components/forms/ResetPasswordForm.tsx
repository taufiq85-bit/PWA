// src/components/forms/ResetPasswordForm.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
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
import { FormSuccess, FormWarning } from '@/components/ui/form-error'
import { KeyRound, Shield } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

interface ResetPasswordFormProps {
  onSubmit?: (data: ResetPasswordFormData & { token: string }) => Promise<void>
  className?: string
}

export function ResetPasswordForm({
  onSubmit,
  className,
}: ResetPasswordFormProps) {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  })

  const handleSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      form.setError('root', {
        message: 'Token reset tidak valid atau telah expired',
      })
      return
    }

    setIsLoading(true)
    setSuccessMessage('')

    try {
      if (onSubmit) {
        await onSubmit({ ...data, token })
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))
        console.log('Reset password data:', { ...data, token })
      }

      setSuccessMessage(
        'Password berhasil direset! Anda akan dialihkan ke halaman login...'
      )
      form.reset()

      // Redirect after success
      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)
    } catch (error) {
      console.error('Reset password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Reset Password
        </CardTitle>
        <CardDescription>Buat password baru untuk akun Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <BaseForm
          form={form}
          onSubmit={handleSubmit}
          showErrorSummary={true}
          className="space-y-4"
        >
          <FormSuccess message={successMessage} />

          {!token && (
            <FormWarning message="Link reset password tidak valid atau telah expired. Silakan request ulang." />
          )}

          <FormInput
            form={form}
            name="password"
            label="Password Baru"
            placeholder="Masukkan password baru"
            type="password"
            required
            description="Minimal 8 karakter, kombinasi huruf besar, huruf kecil, dan angka"
          />

          <FormInput
            form={form}
            name="confirmPassword"
            label="Konfirmasi Password"
            placeholder="Konfirmasi password baru"
            type="password"
            required
          />

          <FormSubmitButton loading={isLoading} disabled={!token}>
            <KeyRound className="h-4 w-4 mr-2" />
            Reset Password
          </FormSubmitButton>
        </BaseForm>
      </CardContent>
    </Card>
  )
}

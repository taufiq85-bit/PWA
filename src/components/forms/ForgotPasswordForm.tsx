// src/components/forms/ForgotPasswordForm.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
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
import { FormSuccess, FormInfo } from '@/components/ui/form-error'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

interface ForgotPasswordFormProps {
  onSubmit?: (data: ForgotPasswordFormData) => Promise<void>
  className?: string
}

export function ForgotPasswordForm({
  onSubmit,
  className,
}: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setSuccessMessage('')

    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))
        console.log('Forgot password data:', data)
      }

      setSuccessMessage(
        'Link reset password telah dikirim ke email Anda. Silakan periksa inbox.'
      )
      form.reset()
    } catch (error) {
      console.error('Forgot password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Lupa Password</CardTitle>
        <CardDescription>
          Masukkan email yang terdaftar untuk mendapatkan link reset password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BaseForm form={form} onSubmit={handleSubmit} className="space-y-4">
          <FormSuccess message={successMessage} />

          <FormInfo message="Link reset password akan dikirim ke email Anda dan berlaku selama 24 jam" />

          <FormInput
            form={form}
            name="email"
            label="Email Terdaftar"
            placeholder="nama@akbidmegabuana.ac.id"
            type="email"
            required
            description="Gunakan email yang terdaftar di sistem"
          />

          <FormSubmitButton loading={isLoading} className="w-full">
            {isLoading ? (
              'Mengirim link...'
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Kirim Link Reset Password
              </>
            )}
          </FormSubmitButton>

          <div className="text-center">
            <Link to="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Login
              </Button>
            </Link>
          </div>
        </BaseForm>
      </CardContent>
    </Card>
  )
}

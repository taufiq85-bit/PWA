import { ForgotPasswordForm } from '../components/forms/ForgotPasswordForm'

export function ForgotPasswordPage() {
  const handleSuccess = (email: string) => {
    console.log('Password reset email sent to:', email)
  }

  const handleBackToLogin = () => {
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sistem Praktikum AKBID
          </h2>
          <p className="mt-2 text-sm text-gray-600">Reset password akun Anda</p>
        </div>

        <ForgotPasswordForm
          onSuccess={handleSuccess}
          onBackToLogin={handleBackToLogin}
        />
      </div>
    </div>
  )
}

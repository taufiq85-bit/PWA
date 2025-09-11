import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { RegisterForm } from '../../components/forms/RegisterForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'

export function RegisterPage() {
  const { isAuthenticated, loading } = useAuthContext()

  // Redirect if already authenticated
  if (isAuthenticated && !loading) {
    return <Navigate to="/dashboard" replace />
  }

  const handleRegistrationSuccess = () => {
    console.log(
      'Registration successful, staying on page for email verification'
    )
    // Stay on page to show success message and email verification instructions
  }

  const handleLoginRedirect = () => {
    console.log('Redirecting to login page')
    window.location.href = '/login'
  }

  return (
    <React.Fragment>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Sistem Praktikum AKBID
            </h2>
            <p className="mt-2 text-sm text-gray-600">Daftar akun baru</p>
          </div>

          {/* Register Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Buat Akun Baru</CardTitle>
              <CardDescription>
                Isi form di bawah ini untuk mendaftar akun sistem praktikum
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm
                onSuccess={handleRegistrationSuccess}
                onLoginRedirect={handleLoginRedirect}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </React.Fragment>
  )
}

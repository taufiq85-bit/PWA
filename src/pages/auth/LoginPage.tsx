import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { LoginForm } from '../../components/forms/LoginForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

export function LoginPage() {
  const { isAuthenticated, loading } = useAuthContext()

  // Redirect if already authenticated
  if (isAuthenticated && !loading) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLoginSuccess = () => {
    console.log('Login successful, redirecting...')
    // Navigation will be handled by form component
  }

  const handleForgotPassword = () => {
    console.log('Forgot password clicked')
    // Navigate to forgot password page
    window.location.href = '/forgot-password'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sistem Praktikum AKBID
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Masuk ke akun Anda
          </p>
        </div>

        {/* Login Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your email and password to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm 
              onSuccess={handleLoginSuccess}
              onForgotPassword={handleForgotPassword}
            />
          </CardContent>
        </Card>

        {/* Additional Links */}
        <div className="text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-primary hover:underline">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Mock providers - simplified for Phase 1
const TestProviders = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestProviders, ...options })

// Mock user data
export const mockUser = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'mahasiswa' as const,
}

// Mock course data
export const mockCourse = {
  id: '1',
  code: 'KBD101',
  name: 'Praktikum Kebidanan Dasar',
  description: 'Praktikum dasar kebidanan',
  credits: 2,
  semester: 1,
}

// Mock quiz data
export const mockQuiz = {
  id: '1',
  title: 'Quiz Kebidanan 1',
  description: 'Quiz praktikum kebidanan dasar',
  durasi_menit: 30,
  total_soal: 10,
  passing_score: 70,
}

export * from '@testing-library/react'
export { customRender as render }

// src/__tests__/utils/validation.test.ts
import { describe, it, expect } from 'vitest'

describe('Validation Utils', () => {
  it('should validate email format', () => {
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    
    expect(validateEmail('test@akbid.ac.id')).toBe(true)
    expect(validateEmail('invalid-email')).toBe(false)
    expect(validateEmail('test@gmail.com')).toBe(true)
  })

  it('should validate NIM format', () => {
    const validateNIM = (nim: string) => /^\d{8,12}$/.test(nim)
    
    expect(validateNIM('12345678')).toBe(true)
    expect(validateNIM('1234')).toBe(false)
    expect(validateNIM('abcd1234')).toBe(false)
  })
})
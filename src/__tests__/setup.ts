// src/__tests__/setup.test.ts
import { describe, it, expect } from 'vitest'

describe('Development Environment Setup', () => {
  it('should have Node.js environment', () => {
    expect(typeof process).toBe('object')
    expect(process.env.NODE_ENV).toBeDefined()
  })

  it('should have Vite environment variables', () => {
    expect(import.meta.env).toBeDefined()
    expect(import.meta.env.DEV).toBeDefined()
  })

  it('should have basic browser APIs available', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
  })
})
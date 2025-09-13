// src/__tests__/integration/supabase.test.ts
import { describe, it, expect } from 'vitest'

describe('Supabase Integration', () => {
  it('should have Supabase environment variables', () => {
    expect(import.meta.env.VITE_SUPABASE_URL).toBeDefined()
    expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBeDefined()
  })

  it('should validate Supabase URL format', () => {
    const url = import.meta.env.VITE_SUPABASE_URL
    if (url) {
      expect(url).toMatch(/^https:\/\/.*\.supabase\.co$/)
    }
  })
})
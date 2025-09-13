// src/__tests__/basic.test.ts
import { describe, it, expect } from 'vitest'

describe('Basic Environment Tests', () => {
  it('should have working test environment', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have process object', () => {
    expect(typeof process).toBe('object')
  })

  it('should have import.meta.env', () => {
    expect(import.meta.env).toBeDefined()
  })
})
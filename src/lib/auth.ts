import { supabase } from './supabase'
// Use supabase to avoid unused import warning and ensure initialization
void supabase

// Security utilities
export const AuthSecurity = {
  // Rate limiting
  rateLimitKey: (identifier: string) => `rate_limit_${identifier}`,
  
  // Check rate limit
  checkRateLimit: (identifier: string, maxAttempts: number = 5, windowMs: number = 300000) => {
    const key = AuthSecurity.rateLimitKey(identifier)
    const stored = localStorage.getItem(key)
    
    if (!stored) {
      localStorage.setItem(key, JSON.stringify({ count: 1, resetTime: Date.now() + windowMs }))
      return { allowed: true, remaining: maxAttempts - 1, resetTime: Date.now() + windowMs }
    }

    const data = JSON.parse(stored)
    
    // Reset if window expired
    if (Date.now() > data.resetTime) {
      localStorage.setItem(key, JSON.stringify({ count: 1, resetTime: Date.now() + windowMs }))
      return { allowed: true, remaining: maxAttempts - 1, resetTime: Date.now() + windowMs }
    }

    // Check if limit exceeded
    if (data.count >= maxAttempts) {
      return { allowed: false, remaining: 0, resetTime: data.resetTime }
    }

    // Increment counter
    data.count += 1
    localStorage.setItem(key, JSON.stringify(data))
    return { allowed: true, remaining: maxAttempts - data.count, resetTime: data.resetTime }
  },

  // Clear rate limit
  clearRateLimit: (identifier: string) => {
    localStorage.removeItem(AuthSecurity.rateLimitKey(identifier))
  },

  // Generate security token
  generateSecurityToken: () => {
    return crypto.getRandomValues(new Uint32Array(4)).join('')
  },

  // Validate email security
  validateEmailSecurity: (email: string) => {
    const domain = email.split('@')[1]
    const suspiciousDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com']
    
    return {
      isValid: true,
      isSuspicious: suspiciousDomains.includes(domain),
      domain
    }
  },

  // Password strength checker
  checkPasswordStrength: (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    const score = Object.values(checks).filter(Boolean).length
    const strength = score < 3 ? 'weak' : score < 4 ? 'medium' : 'strong'

    return { checks, score, strength }
  },

  // Device fingerprinting (basic)
  getDeviceFingerprint: () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Device fingerprint', 2, 2)
    }

    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL(),
      timestamp: Date.now()
    }
  }
}
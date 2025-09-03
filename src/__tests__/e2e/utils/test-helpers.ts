import { Page, expect } from '@playwright/test'

export class TestHelpers {
  constructor(private page: Page) {}

  // Authentication helpers
  async login(email: string, password: string) {
    await this.page.goto('/login')
    await this.page.fill('[data-testid="email-input"]', email)
    await this.page.fill('[data-testid="password-input"]', password)
    await this.page.click('[data-testid="login-button"]')
    await expect(this.page).toHaveURL('/dashboard')
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]')
    await this.page.click('[data-testid="logout-button"]')
    await expect(this.page).toHaveURL('/login')
  }

  // Navigation helpers
  async navigateToPage(path: string) {
    await this.page.goto(path)
    await this.page.waitForLoadState('networkidle')
  }

  // Form helpers
  async fillForm(fields: Record<string, string>) {
    for (const [field, value] of Object.entries(fields)) {
      await this.page.fill(`[data-testid="${field}"]`, value)
    }
  }

  async submitForm(submitButtonTestId = 'submit-button') {
    await this.page.click(`[data-testid="${submitButtonTestId}"]`)
  }

  // Wait helpers
  async waitForSuccess(message?: string) {
    const successSelector = '[data-testid="success-message"]'
    await expect(this.page.locator(successSelector)).toBeVisible()
    if (message) {
      await expect(this.page.locator(successSelector)).toContainText(message)
    }
  }

  async waitForError(message?: string) {
    const errorSelector = '[data-testid="error-message"]'
    await expect(this.page.locator(errorSelector)).toBeVisible()
    if (message) {
      await expect(this.page.locator(errorSelector)).toContainText(message)
    }
  }

  // Performance helpers
  async measureLoadTime(action: () => Promise<void>): Promise<number> {
    const startTime = Date.now()
    await action()
    return Date.now() - startTime
  }

  // PWA helpers
  async testOfflineMode() {
    await this.page.context().setOffline(true)
    await this.page.reload()
    await expect(
      this.page.locator('[data-testid="offline-indicator"]')
    ).toBeVisible()
    await this.page.context().setOffline(false)
  }

  async testPWAInstallation() {
    await this.page.goto('/')
    await this.page.evaluate(() => {
      window.dispatchEvent(new Event('beforeinstallprompt'))
    })
    await expect(
      this.page.locator('[data-testid="install-button"]')
    ).toBeVisible()
  }
}

// Utility functions - fix unused parameter
export async function performanceTest(
  iterations = 10,
  actionFn: () => Promise<void>
) {
  const times: number[] = []
  let successes = 0

  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now()
    try {
      await actionFn()
      successes++
    } catch (error) {
      console.warn(`Performance test iteration ${i + 1} failed:`, error)
    }
    times.push(Date.now() - startTime)
  }

  return {
    averageTime: times.reduce((a, b) => a + b, 0) / times.length,
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
    successRate: successes / iterations,
  }
}

// Environment validation utility
export function validateEnvironment(): {
  valid: boolean
  issues: string[]
  warnings: string[]
} {
  const issues: string[] = []
  const warnings: string[] = []

  // Check required environment variables
  if (!process.env.VITE_SUPABASE_URL) {
    issues.push('VITE_SUPABASE_URL not set')
  }

  if (!process.env.VITE_SUPABASE_ANON_KEY) {
    issues.push('VITE_SUPABASE_ANON_KEY not set')
  }

  // Check optional environment variables
  if (!process.env.VITE_APP_NAME) {
    warnings.push('VITE_APP_NAME not set (using default)')
  }

  if (!process.env.VITE_APP_VERSION) {
    warnings.push('VITE_APP_VERSION not set (using default)')
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
  }
}

// Generate test data utility
export function generateTestData() {
  return {
    user: {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      nim: `TEST${Date.now().toString().slice(-6)}`,
      phone: '08123456789',
    },
    course: {
      code: `TEST${Date.now().toString().slice(-4)}`,
      name: 'Test Course',
      description: 'Test course description',
      credits: 2,
      semester: 1,
    },
    quiz: {
      title: 'Test Quiz',
      description: 'Test quiz description',
      durasi_menit: 30,
      total_soal: 10,
      passing_score: 70,
    },
  }
}

// Create test file utility
export function createTestFile(name = 'test-image.jpg', size = 1024): File {
  const content = 'a'.repeat(size)
  return new File([content], name, { type: 'image/jpeg' })
}

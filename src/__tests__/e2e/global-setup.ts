import { FullConfig } from '@playwright/test'
import { execSync } from 'child_process'

async function globalSetup(_config: FullConfig) {
  console.log('��� Setting up E2E test environment...')

  // Setup test database or other global state
  try {
    // Reset test database (if needed)
    execSync('npm run db:reset:test', { stdio: 'inherit' })
    console.log('✅ Database reset complete')
  } catch {
    console.warn('⚠️ Database reset skipped (not configured)')
  }
}

export default globalSetup
